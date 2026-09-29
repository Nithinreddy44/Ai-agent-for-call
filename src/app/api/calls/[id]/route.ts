import { NextResponse } from 'next/server';
import { INITIAL_CALL_RECORDS } from '@/lib/store';
import { generateCallSummary } from '@/lib/ai-engine';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const call = INITIAL_CALL_RECORDS.find(c => c.id === params.id);
  if (!call) {
    return NextResponse.json({ success: false, error: 'Call record not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, call });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const idx = INITIAL_CALL_RECORDS.findIndex(c => c.id === params.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Call record not found.' }, { status: 404 });
    }

    const updated = {
      ...INITIAL_CALL_RECORDS[idx],
      ...body,
    };

    // If call is being completed, automatically recalculate AI summary if transcript provided
    if (body.status === 'Completed' || body.status === 'Callback Requested' || body.status === 'Do Not Call') {
      if (updated.transcript && updated.transcript.length > 0) {
        updated.summary = generateCallSummary(updated.transcript, updated.status);
      }
    }

    INITIAL_CALL_RECORDS[idx] = updated;

    return NextResponse.json({
      success: true,
      message: 'Call updated successfully.',
      call: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
