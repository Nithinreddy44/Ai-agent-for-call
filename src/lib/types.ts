export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Qualified' | 'Callback' | 'Not Interested' | 'Do Not Call';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  country: string;
  preferredLanguage: string;
  leadSource: string;
  leadStatus: LeadStatus;
  notes: string;
  createdAt: string;
}

export type AgentStyle = 'Professional' | 'Friendly' | 'Consultative' | 'Direct';

export interface AIAgent {
  id: string;
  name: string;
  voiceId: string;
  voiceName: string;
  language: string;
  speakingSpeed: number; // 0.8 to 1.3
  style: AgentStyle;
  greeting: string;
  companyIntro: string;
  systemPrompt: string;
  status: 'Active' | 'Inactive';
}

export interface VoiceSetting {
  id: string;
  name: string;
  provider: 'Sennova Neural' | 'Azure Cognitive' | 'ElevenLabs' | 'Web Speech';
  accent: string;
  gender: 'Female' | 'Male' | 'Neutral';
  languageCode: string;
  languageName: string;
  previewText: string;
  consentVerified: boolean;
}

export interface ScriptSection {
  id: string;
  type: 'opening' | 'intro' | 'qualification' | 'interest' | 'objection' | 'callback' | 'exit';
  title: string;
  content: string;
}

export interface CallScript {
  id: string;
  title: string;
  language: string;
  opening: string;
  companyIntro: string;
  qualificationQuestions: string[];
  interestResponse: string;
  objectionHandlers: { query: string; response: string }[];
  callbackResponse: string;
  notInterestedResponse: string;
  dynamicVariables: string[];
}

export type CallStatus =
  | 'Scheduled'
  | 'Calling'
  | 'Ringing'
  | 'Connected'
  | 'In Conversation'
  | 'Completed'
  | 'No Answer'
  | 'Busy'
  | 'Voicemail'
  | 'Failed'
  | 'Callback Requested'
  | 'Do Not Call';

export type InterestLevel = 'High' | 'Medium' | 'Low' | 'Not Interested' | 'Unknown';

export interface TranscriptMessage {
  id: string;
  speaker: 'AI' | 'Customer' | 'System';
  text: string;
  timestamp: string;
}

export interface CallSummary {
  overview: string;
  requirements: string[];
  objections: string[];
  nextAction: 'Sales Follow-up' | 'Send Deck' | 'Schedule Demo' | 'Callback' | 'No Further Contact';
  sentiment: 'Positive' | 'Neutral' | 'Hesitant' | 'Negative';
}

export interface CallRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCompany: string;
  agentId: string;
  agentName: string;
  language: string;
  voiceName: string;
  startTime: string;
  durationSeconds: number;
  status: CallStatus;
  interestLevel: InterestLevel;
  transcript: TranscriptMessage[];
  summary: CallSummary;
  followUpDate?: string;
  recordingAvailable: boolean;
  recordingUrl?: string;
}

export type CampaignStatus = 'Draft' | 'Scheduled' | 'Running' | 'Paused' | 'Completed';

export interface Campaign {
  id: string;
  name: string;
  targetAudience: string;
  contactIds: string[];
  language: string;
  agentId: string;
  scriptId: string;
  callingSchedule: {
    startTime: string; // e.g. "09:00"
    endTime: string;   // e.g. "18:00"
    days: string[];
  };
  maxCallsPerDay: number;
  status: CampaignStatus;
  totalContacts: number;
  completedCalls: number;
  connectedCalls: number;
  interestedLeads: number;
  createdAt: string;
}

export type FollowUpType = 'Callback' | 'Sales Follow-up' | 'Demo' | 'Meeting';

export interface FollowUp {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  company: string;
  type: FollowUpType;
  scheduledTime: string;
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  completed: boolean;
  callId?: string;
}

export type KBCategory = 'Company Info' | 'Services' | 'Products' | 'FAQs' | 'Pricing' | 'Policies' | 'Sales Info';

export interface KnowledgeArticle {
  id: string;
  category: KBCategory;
  title: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
  approved: boolean;
}

export interface ComplianceRecord {
  id: string;
  contactPhone: string;
  customerName: string;
  status: 'Active DNC' | 'Consent Verified' | 'Opted-Out' | 'Hour Restricted';
  dateAdded: string;
  source: string;
  reason: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: 'Admin' | 'Manager' | 'Agent';
  action: string;
  details: string;
  status: 'Success' | 'Warning' | 'Failed';
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Agent';
  avatar: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}
