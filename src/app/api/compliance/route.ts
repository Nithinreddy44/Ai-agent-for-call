import { NextResponse } from 'next/server';
import { INITIAL_COMPLIANCE, INITIAL_AUDIT_LOGS } from '@/lib/store';
import { ComplianceRecord } from '@/lib/types';
import { validatePhoneNumber } from '@/lib/validation';

let complianceData: ComplianceRecord[] = [...INITIAL_COMPLIANCE];

export async function GET() {
  return NextResponse.json({
    success: true,
    dncRecords: complianceData,
    auditLogs: INITIAL_AUDIT_LOGS
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contactPhone, customerName, reason, source } = body;

    if (!contactPhone) {
      return NextResponse.json({ success: false, error: 'Phone number is required for DNC registration.' }, { status: 400 });
    }

    const phoneVal = validatePhoneNumber(contactPhone);

    const newRecord: ComplianceRecord = {
      id: `comp-${Date.now()}`,
      contactPhone: phoneVal.formatted || contactPhone,
      customerName: customerName || 'Unspecified Contact',
      status: 'Active DNC',
      dateAdded: new Date().toISOString(),
      source: source || 'Manual Admin Addition',
      reason: reason || 'Opted out of telemarketing outreach.'
    };

    complianceData.unshift(newRecord);

    return NextResponse.json({
      success: true,
      message: 'Contact added to Do-Not-Call (DNC) list successfully.',
      record: newRecord
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
