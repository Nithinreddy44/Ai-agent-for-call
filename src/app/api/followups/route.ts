import { NextResponse } from 'next/server';
import { INITIAL_FOLLOWUPS } from '@/lib/store';
import { FollowUp } from '@/lib/types';

let followupsData: FollowUp[] = [...INITIAL_FOLLOWUPS];

export async function GET() {
  return NextResponse.json({ success: true, followups: followupsData });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, customerName, phone, company, type, scheduledTime, priority, notes } = body;

    if (!customerName || !scheduledTime) {
      return NextResponse.json({ success: false, error: 'Customer Name and Scheduled Time are required.' }, { status: 400 });
    }

    const newFollowUp: FollowUp = {
      id: `fol-${Date.now()}`,
      customerId: customerId || `cust-${Date.now()}`,
      customerName,
      phone: phone || '',
      company: company || 'Lead',
      type: type || 'Callback',
      scheduledTime,
      priority: priority || 'Medium',
      notes: notes || '',
      completed: false
    };

    followupsData.unshift(newFollowUp);

    return NextResponse.json({
      success: true,
      message: 'Follow-up task scheduled successfully.',
      followup: newFollowUp
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
