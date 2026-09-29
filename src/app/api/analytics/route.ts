import { NextResponse } from 'next/server';
import { INITIAL_CALL_RECORDS, INITIAL_CUSTOMERS, INITIAL_CAMPAIGNS, INITIAL_FOLLOWUPS } from '@/lib/store';

export async function GET() {
  const totalCalls = INITIAL_CALL_RECORDS.length;
  const connectedCalls = INITIAL_CALL_RECORDS.filter(c => c.status === 'Completed' || c.status === 'In Conversation' || c.status === 'Callback Requested').length;
  const interestedCustomers = INITIAL_CALL_RECORDS.filter(c => c.interestLevel === 'High' || c.interestLevel === 'Medium').length;
  const callbacksScheduled = INITIAL_FOLLOWUPS.filter(f => !f.completed).length;
  const noAnswerCalls = INITIAL_CALL_RECORDS.filter(c => c.status === 'No Answer' || c.status === 'Busy').length;
  const failedCalls = INITIAL_CALL_RECORDS.filter(c => c.status === 'Failed').length;

  const totalDuration = INITIAL_CALL_RECORDS.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const avgDurationSeconds = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

  // Chart data breakdown by day
  const activityData = [
    { day: 'Mon', calls: 14, connected: 11, interested: 6, callbacks: 3, failed: 1 },
    { day: 'Tue', calls: 22, connected: 18, interested: 9, callbacks: 5, failed: 2 },
    { day: 'Wed', calls: 19, connected: 15, interested: 8, callbacks: 4, failed: 1 },
    { day: 'Thu', calls: 28, connected: 23, interested: 12, callbacks: 7, failed: 2 },
    { day: 'Fri', calls: 25, connected: 20, interested: 10, callbacks: 6, failed: 2 },
    { day: 'Sat', calls: 8,  connected: 6,  interested: 2, callbacks: 1, failed: 0 },
    { day: 'Sun', calls: 4,  connected: 3,  interested: 1, callbacks: 0, failed: 0 }
  ];

  // Language distribution analytics
  const languageDistribution = [
    { language: 'English', count: 45, percentage: 42 },
    { language: 'Telugu', count: 28, percentage: 26 },
    { language: 'Hindi', count: 20, percentage: 19 },
    { language: 'Tamil', count: 9,  percentage: 8 },
    { language: 'Other', count: 5,  percentage: 5 }
  ];

  return NextResponse.json({
    success: true,
    overview: {
      totalCalls,
      callsToday: 18,
      connectedCalls,
      connectionRate: totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0,
      interestedCustomers,
      interestRate: totalCalls > 0 ? Math.round((interestedCustomers / totalCalls) * 100) : 0,
      callbacksScheduled,
      noAnswerCalls,
      failedCalls,
      avgDurationSeconds,
      avgDurationFormatted: `${Math.floor(avgDurationSeconds / 60)}m ${avgDurationSeconds % 60}s`
    },
    activityData,
    languageDistribution
  });
}
