import { NextResponse } from 'next/server';
import { INITIAL_SCRIPTS } from '@/lib/store';
import { CallScript } from '@/lib/types';

let scriptsData: CallScript[] = [...INITIAL_SCRIPTS];

export async function GET() {
  return NextResponse.json({ success: true, scripts: scriptsData });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, language, opening, companyIntro, qualificationQuestions, interestResponse, callbackResponse, notInterestedResponse } = body;

    if (!title || !opening) {
      return NextResponse.json({ success: false, error: 'Script Title and Opening greeting are required.' }, { status: 400 });
    }

    const newScript: CallScript = {
      id: `script-${Date.now()}`,
      title,
      language: language || 'English',
      opening,
      companyIntro: companyIntro || 'Sennova Innovation Pvt Ltd solutions.',
      qualificationQuestions: qualificationQuestions || [],
      interestResponse: interestResponse || 'Great! I will arrange a follow-up with our team.',
      objectionHandlers: body.objectionHandlers || [],
      callbackResponse: callbackResponse || 'Certainly! What time would work best for a callback?',
      notInterestedResponse: notInterestedResponse || 'Thank you for your time. Have a great day.',
      dynamicVariables: ['{{customer_name}}', '{{company_name}}', '{{agent_name}}']
    };

    scriptsData.push(newScript);

    return NextResponse.json({ success: true, message: 'Script saved successfully.', script: newScript });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
