import { NextResponse } from 'next/server';
import { INITIAL_CALL_RECORDS, INITIAL_CUSTOMERS, INITIAL_AGENTS, INITIAL_COMPLIANCE } from '@/lib/store';
import { CallRecord } from '@/lib/types';
import { validatePhoneNumber, checkCallingHoursCompliance } from '@/lib/validation';
import { interpolateScript } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, phone, name, agentId, language, voiceName, forceOverride } = body;

    const targetPhone = phone || (customerId ? INITIAL_CUSTOMERS.find(c => c.id === customerId)?.phone : '');
    const targetName = name || (customerId ? INITIAL_CUSTOMERS.find(c => c.id === customerId)?.name : 'Valued Customer');
    const targetCompany = customerId ? INITIAL_CUSTOMERS.find(c => c.id === customerId)?.company || 'Sennova Lead' : 'Lead';

    if (!targetPhone) {
      return NextResponse.json(
        { success: false, error: 'Target phone number is required to start call.' },
        { status: 400 }
      );
    }

    // 1. Phone number validation
    const phoneVal = validatePhoneNumber(targetPhone);
    if (!phoneVal.valid) {
      return NextResponse.json(
        { success: false, error: `Phone validation failed: ${phoneVal.error}` },
        { status: 422 }
      );
    }

    // 2. Compliance: Do-Not-Call (DNC) check
    const isDNC = INITIAL_COMPLIANCE.some(
      c => c.status === 'Active DNC' && (c.contactPhone.includes(targetPhone) || targetPhone.includes(c.contactPhone))
    ) || (customerId && INITIAL_CUSTOMERS.find(c => c.id === customerId)?.leadStatus === 'Do Not Call');

    if (isDNC && !forceOverride) {
      return NextResponse.json(
        {
          success: false,
          error: `Call Blocked: Contact ${targetName} (${targetPhone}) is registered on the Do-Not-Call (DNC) list. Automated outbound calls are prohibited by compliance policy.`,
          code: 'DNC_BLOCKED'
        },
        { status: 403 }
      );
    }

    // 3. Calling Hours Compliance check
    const hoursCheck = checkCallingHoursCompliance();
    if (!hoursCheck.compliant && !forceOverride) {
      return NextResponse.json(
        {
          success: false,
          error: `Compliance Notice: ${hoursCheck.message}`,
          code: 'HOURS_RESTRICTED'
        },
        { status: 403 }
      );
    }

    const agent = INITIAL_AGENTS.find(a => a.id === agentId) || INITIAL_AGENTS[0];
    const initialGreeting = interpolateScript(agent.greeting, { name: targetName, company: targetCompany }, agent);

    const newCall: CallRecord = {
      id: `call-${Date.now()}`,
      customerId: customerId || `cust-temp-${Date.now()}`,
      customerName: targetName,
      customerPhone: phoneVal.formatted || targetPhone,
      customerCompany: targetCompany,
      agentId: agent.id,
      agentName: agent.name,
      language: language || agent.language,
      voiceName: voiceName || agent.voiceName,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      status: 'Connected',
      interestLevel: 'Unknown',
      transcript: [
        {
          id: `msg-0`,
          speaker: 'AI',
          text: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ],
      summary: {
        overview: 'Live AI call initiated. Conversation in progress.',
        requirements: [],
        objections: [],
        nextAction: 'Sales Follow-up',
        sentiment: 'Neutral'
      },
      recordingAvailable: true
    };

    INITIAL_CALL_RECORDS.unshift(newCall);

    return NextResponse.json({
      success: true,
      message: 'Call initiated successfully.',
      call: newCall
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error starting AI call.' },
      { status: 500 }
    );
  }
}
