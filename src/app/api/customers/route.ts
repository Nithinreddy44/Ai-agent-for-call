import { NextResponse } from 'next/server';
import { INITIAL_CUSTOMERS } from '@/lib/store';
import { Customer } from '@/lib/types';
import { validatePhoneNumber, checkDuplicateCustomer } from '@/lib/validation';

// In-memory persistent data store for API routes
let customersData: Customer[] = [...INITIAL_CUSTOMERS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();
  const language = searchParams.get('language');
  const status = searchParams.get('status');

  let filtered = [...customersData];

  if (search) {
    filtered = filtered.filter(
      c =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.company.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
    );
  }

  if (language && language !== 'All') {
    filtered = filtered.filter(c => c.preferredLanguage === language);
  }

  if (status && status !== 'All') {
    filtered = filtered.filter(c => c.leadStatus === status);
  }

  return NextResponse.json({
    success: true,
    total: filtered.length,
    customers: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, company, country, preferredLanguage, leadSource, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Customer Name and Phone Number are required fields.' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneVal = validatePhoneNumber(phone);
    if (!phoneVal.valid) {
      return NextResponse.json(
        { success: false, error: phoneVal.error },
        { status: 422 }
      );
    }

    // Check duplicate contact
    const dupCheck = checkDuplicateCustomer(customersData, phoneVal.formatted || phone, email);
    if (dupCheck.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: `Duplicate contact detected. Customer ${dupCheck.matchedCustomer?.name} already exists with phone ${dupCheck.matchedCustomer?.phone}.`,
          matchedCustomer: dupCheck.matchedCustomer
        },
        { status: 409 }
      );
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone: phoneVal.formatted || phone,
      email: email || '',
      company: company || 'Independent',
      country: country || 'India',
      preferredLanguage: preferredLanguage || 'English',
      leadSource: leadSource || 'Manual Entry',
      leadStatus: 'New',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    customersData.unshift(newCustomer);

    return NextResponse.json(
      { success: true, message: 'Customer added successfully.', customer: newCustomer },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error processing customer creation.' },
      { status: 500 }
    );
  }
}
