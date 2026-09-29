import { NextResponse } from 'next/server';
import { INITIAL_AGENTS, INITIAL_VOICES } from '@/lib/store';
import { AIAgent } from '@/lib/types';

let agentsData: AIAgent[] = [...INITIAL_AGENTS];

export async function GET() {
  return NextResponse.json({
    success: true,
    agents: agentsData,
    voices: INITIAL_VOICES
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, voiceId, language, speakingSpeed, style, greeting, companyIntro, systemPrompt } = body;

    if (!name || !greeting) {
      return NextResponse.json({ success: false, error: 'Agent Name and Greeting template are required.' }, { status: 400 });
    }

    const voice = INITIAL_VOICES.find(v => v.id === voiceId) || INITIAL_VOICES[0];

    const newAgent: AIAgent = {
      id: `agent-${Date.now()}`,
      name,
      voiceId: voice.id,
      voiceName: voice.name,
      language: language || 'English',
      speakingSpeed: speakingSpeed || 1.0,
      style: style || 'Professional',
      greeting,
      companyIntro: companyIntro || 'Sennova Innovation provides digital solutions.',
      systemPrompt: systemPrompt || 'You are an AI sales assistant for Sennova Innovation Pvt Ltd.',
      status: 'Active'
    };

    agentsData.push(newAgent);

    return NextResponse.json({ success: true, message: 'AI Agent created successfully.', agent: newAgent });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
