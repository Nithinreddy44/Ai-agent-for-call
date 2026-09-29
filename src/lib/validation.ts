import { Customer } from './types';

/**
 * Validates international phone numbers in E.164 or common formats.
 * E.g., +91 98765 43210, +1 (555) 019-2831, 9876543210
 */
export function validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required.' };
  }

  const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
  
  // Basic numeric check with optional leading +
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;

  if (!phoneRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid phone number format. Must contain 8 to 15 digits (e.g. +919876543210 or 9876543210).'
    };
  }

  // Format cleanly as E.164 if possible
  const formatted = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
  return { valid: true, formatted };
}

/**
 * Validates email addresses
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Detects duplicate contacts in existing customer list
 */
export function checkDuplicateCustomer(
  customers: Customer[],
  newPhone: string,
  newEmail?: string,
  excludeId?: string
): { isDuplicate: boolean; matchField?: 'phone' | 'email'; matchedCustomer?: Customer } {
  const cleanPhone = newPhone.trim().replace(/[\s\-\(\)]/g, '');

  for (const c of customers) {
    if (excludeId && c.id === excludeId) continue;

    const existingClean = c.phone.trim().replace(/[\s\-\(\)]/g, '');
    if (existingClean === cleanPhone) {
      return { isDuplicate: true, matchField: 'phone', matchedCustomer: c };
    }

    if (newEmail && c.email && c.email.toLowerCase().trim() === newEmail.toLowerCase().trim()) {
      return { isDuplicate: true, matchField: 'email', matchedCustomer: c };
    }
  }

  return { isDuplicate: false };
}

/**
 * Parsed CSV output format
 */
export interface CSVImportResult {
  successful: Partial<Customer>[];
  errors: { row: number; raw: Record<string, string>; message: string }[];
  totalRows: number;
}

/**
 * Robust CSV string parser
 */
export function parseCustomerCSV(csvContent: string): CSVImportResult {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { successful: [], errors: [{ row: 1, raw: {}, message: 'CSV file is empty or missing headers.' }], totalRows: 0 };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  
  const nameIdx = headers.findIndex(h => h.includes('name'));
  const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
  const emailIdx = headers.findIndex(h => h.includes('email'));
  const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('org'));
  const langIdx = headers.findIndex(h => h.includes('lang') || h.includes('language'));
  const countryIdx = headers.findIndex(h => h.includes('country'));

  if (phoneIdx === -1) {
    return { successful: [], errors: [{ row: 1, raw: {}, message: 'Missing required "Phone Number" header column.' }], totalRows: lines.length - 1 };
  }

  const successful: Partial<Customer>[] = [];
  const errors: CSVImportResult['errors'] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowStr = lines[i];
    // Split by comma ignoring quoted fields
    const cols = rowStr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rowStr.split(',');
    const cleanCols = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));

    const rawObj: Record<string, string> = {};
    headers.forEach((h, idx) => { rawObj[h] = cleanCols[idx] || ''; });

    const name = nameIdx !== -1 ? cleanCols[nameIdx] : 'Prospect';
    const phone = cleanCols[phoneIdx] || '';
    const email = emailIdx !== -1 ? cleanCols[emailIdx] : '';
    const company = companyIdx !== -1 ? cleanCols[companyIdx] : 'Independent';
    const language = langIdx !== -1 ? cleanCols[langIdx] : 'English';
    const country = countryIdx !== -1 ? cleanCols[countryIdx] : 'India';

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      errors.push({ row: i + 1, raw: rawObj, message: phoneValidation.error || 'Invalid phone number.' });
      continue;
    }

    successful.push({
      name: name || 'Valued Customer',
      phone: phoneValidation.formatted || phone,
      email,
      company,
      preferredLanguage: language,
      country,
      leadSource: 'CSV Import',
      leadStatus: 'New',
      notes: 'Imported via CSV',
    });
  }

  return { successful, errors, totalRows: lines.length - 1 };
}

/**
 * Checks calling hours compliance (e.g. 09:00 to 20:00 local time)
 */
export function checkCallingHoursCompliance(scheduleStart = '09:00', scheduleEnd = '20:00'): { compliant: boolean; message?: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotal = currentHour * 60 + currentMinute;

  const [startH, startM] = scheduleStart.split(':').map(Number);
  const [endH, endM] = scheduleEnd.split(':').map(Number);

  const startTotal = startH * 60 + (startM || 0);
  const endTotal = endH * 60 + (endM || 0);

  if (currentTotal < startTotal || currentTotal > endTotal) {
    return {
      compliant: false,
      message: `Outside legal calling window (${scheduleStart} - ${scheduleEnd}). Calls automated outside these hours require explicit user override.`
    };
  }

  return { compliant: true };
}
