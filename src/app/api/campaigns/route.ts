import { NextResponse } from 'next/server';
import { INITIAL_CAMPAIGNS } from '@/lib/store';
import { Campaign } from '@/lib/types';

let campaignsData: Campaign[] = [...INITIAL_CAMPAIGNS];

export async function GET() {
  return NextResponse.json({
    success: true,
    total: campaignsData.length,
    campaigns: campaignsData,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, targetAudience, contactIds, language, agentId, scriptId, maxCallsPerDay } = body;

    if (!name || !contactIds || contactIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign Name and Contact List are required.' },
        { status: 400 }
      );
    }

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      targetAudience: targetAudience || 'General Outreach',
      contactIds,
      language: language || 'English',
      agentId: agentId || 'agent-1',
      scriptId: scriptId || 'script-1',
      callingSchedule: {
        startTime: '09:00',
        endTime: '18:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      },
      maxCallsPerDay: maxCallsPerDay || 50,
      status: 'Draft',
      totalContacts: contactIds.length,
      completedCalls: 0,
      connectedCalls: 0,
      interestedLeads: 0,
      createdAt: new Date().toISOString(),
    };

    campaignsData.unshift(newCampaign);

    return NextResponse.json(
      { success: true, message: 'Campaign created successfully.', campaign: newCampaign },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
