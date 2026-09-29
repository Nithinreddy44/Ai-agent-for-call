import {
  Customer,
  AIAgent,
  VoiceSetting,
  CallScript,
  CallRecord,
  Campaign,
  FollowUp,
  KnowledgeArticle,
  ComplianceRecord,
  AuditLog,
  SystemUser,
} from './types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Nithin Kumar',
    phone: '+91 63036 95181',
    email: 'nithin@sennova.io',
    company: 'Sennova Innovation Pvt Ltd',
    country: 'India',
    preferredLanguage: 'English',
    leadSource: 'Executive Inbound',
    leadStatus: 'Interested',
    notes: 'Primary executive caller for AI Voice automation platform.',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Nithin Kumar (Regional)',
    phone: '+91 63036 95181',
    email: 'nithin.kumar@sennova.io',
    company: 'Sennova Regional Systems',
    country: 'India',
    preferredLanguage: 'Telugu',
    leadSource: 'Direct Executive Referral',
    leadStatus: 'Callback',
    notes: 'Requested Telugu voice agent demo for regional calling.',
    createdAt: '2026-08-03T14:30:00Z',
  },
  {
    id: 'cust-3',
    name: 'Nithin Kumar (Enterprise)',
    phone: '+91 63036 95181',
    email: 'nithin.e@sennova.io',
    company: 'Sennova Enterprise Labs',
    country: 'India',
    preferredLanguage: 'Hindi',
    leadSource: 'Executive Outreach',
    leadStatus: 'Qualified',
    notes: 'Needs enterprise AI voice calling API integration.',
    createdAt: '2026-08-04T09:15:00Z',
  }
];

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'agent-1',
    name: 'Aria - Sennova Executive AI Agent',
    voiceId: 'v-eng-female-1',
    voiceName: 'Sennova Indian English Female (Neural)',
    language: 'English',
    speakingSpeed: 1.0,
    style: 'Professional',
    greeting: "Hello Nithin, I'm Aria, an AI voice assistant calling on behalf of Sennova Innovation Pvt Ltd from +91 63036 95181. Is this a convenient time for a quick conversation?",
    companyIntro: "Sennova Innovation provides cutting-edge AI voice automation and software solutions that help enterprises scale customer interactions seamlessly.",
    systemPrompt: "You are Aria, a polite and professional AI Sales Representative for Sennova Innovation Pvt Ltd calling from caller ID +91 63036 95181. Always identify yourself as an AI assistant transparently.",
    status: 'Active',
  },
  {
    id: 'agent-2',
    name: 'Vikram - Telugu AI Outreach Agent',
    voiceId: 'v-tel-male-1',
    voiceName: 'Sennova Telugu Male (Neural)',
    language: 'Telugu',
    speakingSpeed: 1.0,
    style: 'Consultative',
    greeting: "నమస్కారం Nithin గారూ, నేను Sennova Innovation Pvt Ltd +91 63036 95181 నుండి మాట్లాడుతున్న AI వాయిస్ అసిస్టెంట్ విక్రమ్. ఇది మీతో మాట్లాడటానికి వీలైన సమయమేనా?",
    companyIntro: "మా Sennova Innovation వ్యాపారాల కోసం AI ఆధారిత డిజిటల్ మరియు వాయిస్ కాలింగ్ సొల్యూషన్స్ అందిస్తుంది.",
    systemPrompt: "You are Vikram, a fluent Telugu AI business representative for Sennova Innovation Pvt Ltd calling from +91 63036 95181. Always speak natural conversational Telugu calmly.",
    status: 'Active',
  },
  {
    id: 'agent-3',
    name: 'Aditi - Multilingual SDR Agent',
    voiceId: 'v-hin-female-1',
    voiceName: 'Sennova Hindi Female (Neural)',
    language: 'Hindi',
    speakingSpeed: 1.05,
    style: 'Friendly',
    greeting: "नमस्ते Nithin जी, मैं Sennova Innovation Pvt Ltd की तरफ से +91 63036 95181 से AI वॉइस अस्सिटेंट अदिति बात कर रही हूँ। क्या आपसे 2 मिनट बात हो सकती है?",
    companyIntro: "हम व्यवसायों के लिए AI वॉइस कॉलिंग और डिजिटल सॉल्यूशन प्रदान करते हैं जो कस्टमर एक्सपीरियंस को 10x बेहतर बनाते हैं।",
    systemPrompt: "You are Aditi, a warm and polite Hindi AI voice assistant. Introduce Sennova's automation capabilities from caller ID +91 63036 95181.",
    status: 'Active',
  }
];

export const INITIAL_VOICES: VoiceSetting[] = [
  {
    id: 'v-eng-female-1',
    name: 'Sennova Indian English Female (Neural)',
    provider: 'Sennova Neural',
    accent: 'Indian English',
    gender: 'Female',
    languageCode: 'en-IN',
    languageName: 'English (India)',
    previewText: 'Hello Nithin! I am Sennova\'s AI voice assistant calling from +91 63036 95181. How may I assist your business today?',
    consentVerified: true,
  },
  {
    id: 'v-tel-male-1',
    name: 'Sennova Telugu Male (Neural)',
    provider: 'Sennova Neural',
    accent: 'Telugu Natural',
    gender: 'Male',
    languageCode: 'te-IN',
    languageName: 'Telugu (తెలుగు)',
    previewText: 'నమస్కారం Nithin గారూ! నేను Sennova డిజిటల్ AI వాయిస్ అసిస్టెంట్‌ని +91 63036 95181 నుండి మాట్లాడుతున్నాను.',
    consentVerified: true,
  },
  {
    id: 'v-hin-female-1',
    name: 'Sennova Hindi Female (Neural)',
    provider: 'Sennova Neural',
    accent: 'Hindi Modern',
    gender: 'Female',
    languageCode: 'hi-IN',
    languageName: 'Hindi (हिंदी)',
    previewText: 'नमस्ते Nithin जी! मैं Sennova AI वॉइस असिस्टेंट हूँ +91 63036 95181 से। क्या आप अपने कॉल्स ऑटोमेट करना चाहते हैं?',
    consentVerified: true,
  }
];

export const INITIAL_SCRIPTS: CallScript[] = [
  {
    id: 'script-1',
    title: 'Sennova Enterprise Software Outreach - Nithin (+91 63036 95181)',
    language: 'English',
    opening: "Hello Nithin, I'm an AI voice assistant calling on behalf of Sennova Innovation Pvt Ltd from +91 63036 95181. Is this a convenient time for a quick conversation?",
    companyIntro: "We develop enterprise AI and software solutions that streamline operational workflows, reduce call center overhead, and elevate customer experience.",
    qualificationQuestions: [
      "Are you currently looking for AI or digital automation solutions to improve your customer communications?",
      "Are you experiencing any bottlenecks or high operational costs with your current call or support team?",
      "Would you be interested in seeing a 5-minute interactive demo of our voice AI agent?"
    ],
    interestResponse: "That's fantastic to hear, Nithin! I can arrange a customized follow-up session with our senior solution architect from Sennova.",
    objectionHandlers: [
      {
        query: "How much does your service cost?",
        response: "Our pricing is customized based on your call volume and required AI voice integrations. I can send a detailed proposal directly to your email."
      }
    ],
    callbackResponse: "Certainly, Nithin! What day and time would be most convenient for our Sennova specialist to call you back?",
    notInterestedResponse: "No problem at all! Thank you very much for your time today, Nithin. Have a wonderful day ahead.",
    dynamicVariables: ['{{customer_name}}', '{{company_name}}', '{{agent_name}}', '{{service_name}}']
  }
];

export const INITIAL_CALL_RECORDS: CallRecord[] = [
  {
    id: 'call-101',
    customerId: 'cust-1',
    customerName: 'Nithin Kumar',
    customerPhone: '+91 63036 95181',
    customerCompany: 'Sennova Innovation Pvt Ltd',
    agentId: 'agent-1',
    agentName: 'Aria - Sennova Executive AI Agent',
    language: 'English',
    voiceName: 'Sennova Indian English Female (Neural)',
    startTime: '2026-08-11T10:15:00Z',
    durationSeconds: 142,
    status: 'Completed',
    interestLevel: 'High',
    transcript: [
      { id: 't1', speaker: 'AI', text: "Hello Nithin! I'm an AI voice assistant calling on behalf of Sennova Innovation Pvt Ltd from +91 63036 95181. Is this a convenient time for a quick conversation?", timestamp: '10:15:02' },
      { id: 't2', speaker: 'Customer', text: "Yes, speaking. What is this regarding?", timestamp: '10:15:08' },
      { id: 't3', speaker: 'AI', text: "We work on AI technology and digital voice solutions that help businesses improve their operations and customer outreach efficiency.", timestamp: '10:15:15' },
      { id: 't4', speaker: 'Customer', text: "Great! Can your system handle Indian regional languages like Telugu for our outreach?", timestamp: '10:15:28' },
      { id: 't5', speaker: 'AI', text: "Yes, absolutely Nithin! Sennova's AI voice engine natively supports English, Telugu, Hindi, Tamil, Kannada, and 4 other Indian languages.", timestamp: '10:15:40' },
      { id: 't6', speaker: 'Customer', text: "That sounds promising. Let's schedule a full product demo tomorrow at 11 AM.", timestamp: '10:15:58' },
      { id: 't7', speaker: 'AI', text: "I'd be glad to. I have scheduled a product demo for tomorrow at 11:00 AM. Thank you for your time, Nithin!", timestamp: '10:16:15' }
    ],
    summary: {
      overview: 'Nithin connected warmly and expressed explicit interest in AI voice call automation for regional language outreach.',
      requirements: ['Regional language support (Telugu)', 'Appointment reminder automation', 'API CRM integration'],
      objections: [],
      nextAction: 'Schedule Demo',
      sentiment: 'Positive'
    },
    followUpDate: '2026-08-12T11:00:00Z',
    recordingAvailable: true,
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Sennova Executive AI Outreach (+91 63036 95181)',
    targetAudience: 'Sennova Innovation Leadership & Executive Team',
    contactIds: ['cust-1', 'cust-2', 'cust-3'],
    language: 'English',
    agentId: 'agent-1',
    scriptId: 'script-1',
    callingSchedule: {
      startTime: '09:30',
      endTime: '18:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    maxCallsPerDay: 50,
    status: 'Running',
    totalContacts: 3,
    completedCalls: 2,
    connectedCalls: 2,
    interestedLeads: 2,
    createdAt: '2026-08-10T09:00:00Z'
  }
];

export const INITIAL_FOLLOWUPS: FollowUp[] = [
  {
    id: 'fol-1',
    customerId: 'cust-1',
    customerName: 'Nithin Kumar',
    phone: '+91 63036 95181',
    company: 'Sennova Innovation Pvt Ltd',
    type: 'Demo',
    scheduledTime: '2026-08-12T11:00:00Z',
    priority: 'High',
    notes: 'Demonstrate Telugu voice agent appointment flow & API webhooks for Nithin.',
    completed: false,
    callId: 'call-101'
  }
];

export const INITIAL_KNOWLEDGE: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    category: 'Company Info',
    title: 'Sennova Innovation Pvt Ltd Overview',
    content: 'Sennova Innovation Pvt Ltd is an AI technology company developing enterprise voice automation, conversational AI platforms, and bespoke digital solutions. Verified Outbound Caller ID: +91 63036 95181.',
    updatedBy: 'Nithin Kumar',
    updatedAt: '2026-08-01T09:00:00Z',
    approved: true
  }
];

export const INITIAL_COMPLIANCE: ComplianceRecord[] = [
  {
    id: 'comp-2',
    contactPhone: '+91 63036 95181',
    customerName: 'Nithin Kumar',
    status: 'Consent Verified',
    dateAdded: '2026-08-01T10:00:00Z',
    source: 'Verified Caller ID Form',
    reason: 'Verified Sennova Outbound Caller ID & Executive Opt-in.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-11T11:30:00Z',
    user: 'nithin@sennova.io',
    role: 'Admin',
    action: 'Verified Caller ID Set',
    details: 'Configured verified outbound caller ID to +91 63036 95181 for Nithin Kumar.',
    status: 'Success'
  }
];

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'Nithin Kumar',
    email: 'nithin@sennova.io',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    lastActive: 'Just now'
  }
];
