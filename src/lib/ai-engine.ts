import { Customer, AIAgent, CallScript, KnowledgeArticle, CallSummary, InterestLevel } from './types';

/**
 * Replaces dynamic placeholders in scripts with customer and agent values
 */
export function interpolateScript(
  text: string,
  customer?: Partial<Customer>,
  agent?: Partial<AIAgent>,
  extraVars?: Record<string, string>
): string {
  if (!text) return '';
  let result = text;
  
  const custName = customer?.name || 'Customer';
  const compName = customer?.company || 'your company';
  const agentName = agent?.name?.split('-')[0]?.trim() || 'Aria';
  const serviceName = extraVars?.service_name || 'AI Voice & Digital Automation Solutions';

  result = result.replace(/\{\{\s*customer_name\s*\}\}/gi, custName);
  result = result.replace(/\{\{\s*company_name\s*\}\}/gi, compName);
  result = result.replace(/\{\{\s*agent_name\s*\}\}/gi, agentName);
  result = result.replace(/\{\{\s*service_name\s*\}\}/gi, serviceName);

  if (extraVars) {
    Object.entries(extraVars).forEach(([k, v]) => {
      const regex = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'gi');
      result = result.replace(regex, v);
    });
  }

  return result;
}

/**
 * AI Reasoning Engine to process customer utterance during live call
 */
export interface AIResponseResult {
  text: string;
  detectedOutcome?: 'INTERESTED' | 'NOT_INTERESTED' | 'CALLBACK' | 'DNC' | 'CONTINUE';
  detectedInterest?: InterestLevel;
  suggestedAction?: string;
  sourceKnowledgeId?: string;
}

export function processCustomerUtterance(
  input: string,
  script: CallScript,
  customer: Customer,
  agent: AIAgent,
  knowledgeBase: KnowledgeArticle[],
  callHistoryMessages: { speaker: string; text: string }[]
): AIResponseResult {
  const cleanInput = input.trim().toLowerCase();

  // 1. Detect Do Not Call requests
  if (
    cleanInput.includes('do not call') ||
    cleanInput.includes('remove my number') ||
    cleanInput.includes('stop calling') ||
    cleanInput.includes('unsubscribe') ||
    cleanInput.includes('వద్దు') ||
    cleanInput.includes('कॉल मत करो')
  ) {
    return {
      text: "Understood, " + customer.name + ". I have immediately registered your request on our Do Not Call list and we will not contact you again. Have a great day.",
      detectedOutcome: 'DNC',
      detectedInterest: 'Not Interested',
      suggestedAction: 'Add to Do Not Call List'
    };
  }

  // 2. Detect Callback requests
  if (
    cleanInput.includes('call back') ||
    cleanInput.includes('busy now') ||
    cleanInput.includes('in a meeting') ||
    cleanInput.includes('later') ||
    cleanInput.includes('tomorrow') ||
    cleanInput.includes('తర్వాత') ||
    cleanInput.includes('बाद में')
  ) {
    const resp = interpolateScript(script.callbackResponse, customer, agent);
    return {
      text: resp || `Certainly, ${customer.name}. What date and time would be most convenient for our Sennova specialist to call you back?`,
      detectedOutcome: 'CALLBACK',
      detectedInterest: 'Medium',
      suggestedAction: 'Schedule Callback'
    };
  }

  // 3. Detect Not Interested
  if (
    cleanInput.includes('not interested') ||
    cleanInput.includes('no thanks') ||
    cleanInput.includes('don\'t need') ||
    cleanInput.includes('ఆసక్తి లేదు') ||
    cleanInput.includes('नहीं चाहिए')
  ) {
    const resp = interpolateScript(script.notInterestedResponse, customer, agent);
    return {
      text: resp || `No problem at all, ${customer.name}. Thank you for your time today. Have a wonderful day ahead!`,
      detectedOutcome: 'NOT_INTERESTED',
      detectedInterest: 'Not Interested',
      suggestedAction: 'Mark Not Interested'
    };
  }

  // 4. Check Script Objection Handlers
  if (script.objectionHandlers) {
    for (const obj of script.objectionHandlers) {
      if (cleanInput.includes(obj.query.toLowerCase())) {
        return {
          text: interpolateScript(obj.response, customer, agent),
          detectedOutcome: 'CONTINUE',
          detectedInterest: 'Medium'
        };
      }
    }
  }

  // 5. Search Approved Knowledge Base for Grounded Answers
  for (const kb of knowledgeBase) {
    if (!kb.approved) continue;
    const titleMatch = cleanInput.includes(kb.title.toLowerCase());
    const catMatch = cleanInput.includes(kb.category.toLowerCase());

    if (
      cleanInput.includes('cost') || cleanInput.includes('price') || cleanInput.includes('pricing') || cleanInput.includes('ధర')
    ) {
      if (kb.category === 'Pricing') {
        return {
          text: interpolateScript(`Regarding pricing: ${kb.content}. Would you like me to schedule a 10-minute demo to provide an exact quote for ${customer.company}?`, customer, agent),
          detectedOutcome: 'CONTINUE',
          detectedInterest: 'High',
          sourceKnowledgeId: kb.id
        };
      }
    }

    if (
      cleanInput.includes('what do you do') || cleanInput.includes('services') || cleanInput.includes('about sennova')
    ) {
      if (kb.category === 'Company Info' || kb.category === 'Products') {
        return {
          text: interpolateScript(`${kb.content}. Are you currently exploring digital automation for ${customer.company}?`, customer, agent),
          detectedOutcome: 'CONTINUE',
          detectedInterest: 'Medium',
          sourceKnowledgeId: kb.id
        };
      }
    }
  }

  // 6. Detect Explicit High Interest / Demo request
  if (
    cleanInput.includes('yes') ||
    cleanInput.includes('interested') ||
    cleanInput.includes('demo') ||
    cleanInput.includes('tell me more') ||
    cleanInput.includes('సరే') ||
    cleanInput.includes('हाँ') ||
    cleanInput.includes('आसपास')
  ) {
    const resp = interpolateScript(script.interestResponse, customer, agent);
    return {
      text: resp || `That's great, ${customer.name}! I will arrange a quick solution demo with our technical team. Would morning or afternoon suit you better?`,
      detectedOutcome: 'INTERESTED',
      detectedInterest: 'High',
      suggestedAction: 'Schedule Demo'
    };
  }

  // 7. Fallback for ungrounded or complex questions (prevent hallucination)
  return {
    text: `I want to make sure I don't give you any incorrect information regarding that. I can have a senior solution specialist from Sennova Innovation follow up with you directly. Would that work for you, ${customer.name}?`,
    detectedOutcome: 'CONTINUE',
    detectedInterest: 'Medium'
  };
}

/**
 * Generates automated post-call summary from transcript
 */
export function generateCallSummary(
  transcript: { speaker: string; text: string }[],
  finalOutcome?: string
): CallSummary {
  if (!transcript || transcript.length === 0) {
    return {
      overview: 'Call terminated before conversation began.',
      requirements: [],
      objections: [],
      nextAction: 'No Further Contact',
      sentiment: 'Neutral'
    };
  }

  const customerText = transcript
    .filter(t => t.speaker === 'Customer')
    .map(t => t.text)
    .join(' ');
  const cleanLower = customerText.toLowerCase();

  const requirements: string[] = [];
  const objections: string[] = [];
  let sentiment: CallSummary['sentiment'] = 'Neutral';
  let nextAction: CallSummary['nextAction'] = 'Sales Follow-up';

  if (cleanLower.includes('telugu') || cleanLower.includes('regional') || cleanLower.includes('hindi')) {
    requirements.push('Multi-lingual Indian language voice support');
  }
  if (cleanLower.includes('crm') || cleanLower.includes('api') || cleanLower.includes('integration')) {
    requirements.push('API / CRM integration');
  }
  if (cleanLower.includes('demo')) {
    requirements.push('Live product demonstration');
  }
  if (cleanLower.includes('pricing') || cleanLower.includes('cost')) {
    requirements.push('Custom commercial proposal');
  }

  if (cleanLower.includes('meeting') || cleanLower.includes('busy')) {
    objections.push('Time constraint during initial call');
    nextAction = 'Callback';
  }
  if (cleanLower.includes('price') || cleanLower.includes('expensive')) {
    objections.push('Cost / budget inquiry');
  }
  if (cleanLower.includes('using another')) {
    objections.push('Incumbent software in place');
  }

  if (cleanLower.includes('do not call') || finalOutcome === 'DNC') {
    nextAction = 'No Further Contact';
    sentiment = 'Negative';
  } else if (cleanLower.includes('demo') || cleanLower.includes('yes') || finalOutcome === 'INTERESTED') {
    nextAction = 'Schedule Demo';
    sentiment = 'Positive';
  } else if (finalOutcome === 'CALLBACK') {
    nextAction = 'Callback';
    sentiment = 'Hesitant';
  }

  return {
    overview: `Automated Call Analysis: Customer engaged in a ${transcript.length}-turn conversation. ${requirements.length > 0 ? 'Expressed interest in: ' + requirements.join(', ') + '.' : 'Standard inquiry handled.'}`,
    requirements: requirements.length > 0 ? requirements : ['General solution information'],
    objections: objections.length > 0 ? objections : ['None noted'],
    nextAction,
    sentiment
  };
}
