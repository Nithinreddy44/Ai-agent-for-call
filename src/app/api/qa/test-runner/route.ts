import { NextResponse } from 'next/server';
import { validatePhoneNumber, checkDuplicateCustomer, parseCustomerCSV } from '@/lib/validation';
import { interpolateScript, processCustomerUtterance, generateCallSummary } from '@/lib/ai-engine';
import { INITIAL_CUSTOMERS, INITIAL_SCRIPTS, INITIAL_AGENTS, INITIAL_KNOWLEDGE } from '@/lib/store';

export async function POST() {
  const startTime = Date.now();
  const testResults: { id: string; name: string; category: string; passed: boolean; details: string }[] = [];

  // Test 1: E.164 Phone Number Validation
  try {
    const validCheck = validatePhoneNumber('+91 98765 43210');
    const invalidCheck = validatePhoneNumber('abc-123');
    const passed = validCheck.valid && !invalidCheck.valid;
    testResults.push({
      id: 'test-1',
      name: 'Phone Validation (E.164)',
      category: 'Validation',
      passed,
      details: passed
        ? 'Successfully accepted E.164 standard format (+919876543210) and rejected non-numeric string.'
        : 'Phone validation failed expected assertion.'
    });
  } catch (e: any) {
    testResults.push({ id: 'test-1', name: 'Phone Validation', category: 'Validation', passed: false, details: e.message });
  }

  // Test 2: Duplicate Contact Detection
  try {
    const dupResult = checkDuplicateCustomer(INITIAL_CUSTOMERS, '+91 98765 43210');
    const passed = dupResult.isDuplicate && dupResult.matchedCustomer?.name === 'Nithin Kumar';
    testResults.push({
      id: 'test-2',
      name: 'Duplicate Contact Check',
      category: 'CRM',
      passed,
      details: passed
        ? 'Correctly identified duplicate contact Nithin Kumar (+91 98765 43210).'
        : 'Duplicate detection failed.'
    });
  } catch (e: any) {
    testResults.push({ id: 'test-2', name: 'Duplicate Check', category: 'CRM', passed: false, details: e.message });
  }

  // Test 3: CSV Import Parser
  try {
    const csvContent = `Name,Phone,Email,Company,Language\nAnil Verma,+919999911111,anil@test.com,Verma Corp,Hindi`;
    const parsed = parseCustomerCSV(csvContent);
    const passed = parsed.successful.length === 1 && parsed.successful[0].name === 'Anil Verma';
    testResults.push({
      id: 'test-3',
      name: 'CSV Parsing & Header Auto-Mapping',
      category: 'Import/Export',
      passed,
      details: passed
        ? 'Successfully parsed 1 contact with correct header column mapping.'
        : 'CSV parsing assertion failed.'
    });
  } catch (e: any) {
    testResults.push({ id: 'test-3', name: 'CSV Parser', category: 'Import/Export', passed: false, details: e.message });
  }

  // Test 4: Dynamic Variable Script Interpolation
  try {
    const rawScript = "Hello {{customer_name}}, calling from {{company_name}}.";
    const interpolated = interpolateScript(rawScript, { name: 'Sita', company: 'Sennova' });
    const passed = interpolated === "Hello Sita, calling from Sennova.";
    testResults.push({
      id: 'test-4',
      name: 'Dynamic Variable Interpolation',
      category: 'AI Engine',
      passed,
      details: passed
        ? `Successfully replaced variables: "${interpolated}".`
        : `Interpolation result mismatch: ${interpolated}`
    });
  } catch (e: any) {
    testResults.push({ id: 'test-4', name: 'Script Interpolation', category: 'AI Engine', passed: false, details: e.message });
  }

  // Test 5: DNC Intent & Legal Compliance Filter
  try {
    const dncUtterance = "Please remove my number and do not call again.";
    const result = processCustomerUtterance(
      dncUtterance,
      INITIAL_SCRIPTS[0],
      INITIAL_CUSTOMERS[0],
      INITIAL_AGENTS[0],
      INITIAL_KNOWLEDGE,
      []
    );
    const passed = result.detectedOutcome === 'DNC' && result.detectedInterest === 'Not Interested';
    testResults.push({
      id: 'test-5',
      name: 'Do-Not-Call (DNC) Verbal Intent Recognition',
      category: 'Compliance',
      passed,
      details: passed
        ? 'System recognized verbal DNC request and triggered automatic opt-out.'
        : 'DNC recognition assertion failed.'
    });
  } catch (e: any) {
    testResults.push({ id: 'test-5', name: 'DNC Intent', category: 'Compliance', passed: false, details: e.message });
  }

  // Test 6: AI Post-Call Summarization & Sentiment Extraction
  try {
    const sampleTranscript = [
      { speaker: 'AI', text: 'Hello Rajesh!' },
      { speaker: 'Customer', text: 'We need Telugu voice support and API integration for our demo.' }
    ];
    const summary = generateCallSummary(sampleTranscript, 'INTERESTED');
    const passed = summary.requirements.length > 0 && summary.nextAction === 'Schedule Demo';
    testResults.push({
      id: 'test-6',
      name: 'Automated Post-Call AI Summarizer',
      category: 'AI Engine',
      passed,
      details: passed
        ? `Summary generated: ${summary.overview}`
        : 'Post-call summary assertion failed.'
    });
  } catch (e: any) {
    testResults.push({ id: 'test-6', name: 'Post-Call Summarizer', category: 'AI Engine', passed: false, details: e.message });
  }

  const durationMs = Date.now() - startTime;
  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;

  return NextResponse.json({
    success: true,
    summary: {
      totalTests: totalCount,
      passed: passedCount,
      failed: totalCount - passedCount,
      durationMs,
      timestamp: new Date().toISOString()
    },
    results: testResults
  });
}
