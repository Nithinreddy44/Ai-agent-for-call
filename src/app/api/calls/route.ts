import { NextResponse } from 'next/server';
import { INITIAL_CALL_RECORDS } from '@/lib/store';
import { CallRecord } from '@/lib/types';

let callsData: CallRecord[] = [...INITIAL_CALL_RECORDS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const language = searchParams.get('language');
  const search = searchParams.get('search')?.toLowerCase();

  let filtered = [...callsData];

  if (status && status !== 'All') {
    filtered = filtered.filter(c => c.status === status);
  }

  if (language && language !== 'All') {
    filtered = filtered.filter(c => c.language === language);
  }

  if (search) {
    filtered = filtered.filter(
      c =>
        c.customerName.toLowerCase().includes(search) ||
        c.customerPhone.includes(search) ||
        c.customerCompany.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    total: filtered.length,
    calls: filtered,
  });
}
