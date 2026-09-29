import { NextResponse } from 'next/server';
import { INITIAL_CUSTOMERS } from '@/lib/store';
import { Customer } from '@/lib/types';
import { parseCustomerCSV, validatePhoneNumber, checkDuplicateCustomer } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sheetUrl, csvContent } = body;

    let targetCsv = csvContent || '';

    if (!targetCsv && sheetUrl) {
      try {
        // Transform Google Sheet edit URL to public export / gviz CSV URL
        let fetchUrl = sheetUrl;
        const matches = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        const gidMatch = sheetUrl.match(/gid=([0-9]+)/);

        if (matches && matches[1]) {
          const docId = matches[1];
          const gid = gidMatch ? gidMatch[1] : '0';
          fetchUrl = `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv&gid=${gid}`;
        }

        const res = await fetch(fetchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        if (res.ok) {
          targetCsv = await res.text();
        } else {
          return NextResponse.json({
            success: false,
            error: `Google Sheets access restricted (Status ${res.status}). Please set sheet sharing to "Anyone with the link can view" or paste the CSV content directly below.`,
            isAuthRequired: true
          }, { status: 401 });
        }
      } catch (e: any) {
        return NextResponse.json({
          success: false,
          error: `Error connecting to Google Sheets: ${e.message}`,
          isAuthRequired: true
        }, { status: 400 });
      }
    }

    if (!targetCsv.trim()) {
      return NextResponse.json({ success: false, error: 'No CSV content received.' }, { status: 400 });
    }

    const parseResult = parseCustomerCSV(targetCsv);

    if (parseResult.successful.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid customer rows found in Google Sheet CSV. Ensure columns contain "Name" and "Phone Number".',
        details: parseResult.errors
      }, { status: 422 });
    }

    let addedCount = 0;
    const addedCustomers: Customer[] = [];

    for (const item of parseResult.successful) {
      const phoneVal = validatePhoneNumber(item.phone || '');
      if (!phoneVal.valid) continue;

      const dupCheck = checkDuplicateCustomer(INITIAL_CUSTOMERS, phoneVal.formatted || item.phone || '');
      if (dupCheck.isDuplicate) continue;

      const newCustomer: Customer = {
        id: `cust-gs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: item.name || 'Google Sheet Lead',
        phone: phoneVal.formatted || item.phone || '',
        email: item.email || '',
        company: item.company || 'Inbound Lead',
        country: item.country || 'India',
        preferredLanguage: item.preferredLanguage || 'English',
        leadSource: 'Google Sheets Integration',
        leadStatus: 'New',
        notes: 'Synced from Google Spreadsheet: 1OPacKLl0wWiWi6wIhLWVHnSktEEfT6nilzQcdaP44sk',
        createdAt: new Date().toISOString(),
      };

      INITIAL_CUSTOMERS.unshift(newCustomer);
      addedCustomers.push(newCustomer);
      addedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully integrated ${addedCount} leads from Google Spreadsheet!`,
      importedCount: addedCount,
      totalRows: parseResult.totalRows,
      importedCustomers: addedCustomers,
      errors: parseResult.errors
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error syncing Google Sheet.' }, { status: 500 });
  }
}
