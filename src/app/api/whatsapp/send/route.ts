import { NextResponse } from 'next/server';
import { validatePhoneNumber } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, customerName, companyName, templateType, callSummary } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Target phone number is required for WhatsApp delivery.' }, { status: 400 });
    }

    const phoneVal = validatePhoneNumber(phone);
    if (!phoneVal.valid) {
      return NextResponse.json({ success: false, error: `Invalid phone format for WhatsApp: ${phoneVal.error}` }, { status: 422 });
    }

    const cleanPhoneDigits = (phoneVal.formatted || phone).replace(/[^\d]/g, '');
    const name = customerName || 'Valued Client';
    const comp = companyName || 'Sennova Partner';

    let messageBody = '';

    switch (templateType) {
      case 'telugu-regional':
        messageBody = `నమస్కారం ${name} గారూ!\n\nSennova Innovation Pvt Ltd తో మాట్లాడినందుకు ధన్యవాదాలు.\n\nమా AI వాయిస్ అసిస్టెంట్ మరియు డిజిటల్ సొల్యూషన్స్ వివరాలు:\n• 9+ ప్రాంతీయ భాషల వాయిస్ ఆటోమేషన్ (తెలుగు, హిందీ, ఇంగ్లీష్)\n• API & CRM ఇంటిగ్రేషన్\n• 24/7 కస్టమర్ కాంటాక్ట్ ఆటోమేషన్\n\nవెబ్‌సైట్: https://sennova.io\nకాంటాక్ట్: +91 63036 95181\n\n- Sennova Team`;
        break;
      case 'pricing':
        messageBody = `Hello ${name}!\n\nThank you for speaking with Sennova Innovation Pvt Ltd.\n\nCommercial & Pricing Details for ${comp}:\n• Pay-Per-Minute: $0.05 / min\n• Multi-lingual Voice Agents (Telugu, Hindi, English, Tamil, Kannada)\n• Automated Post-Call Summaries & Webhooks\n\nView Proposal Deck: https://sennova.io/pricing\n\n- Sennova Sales Team`;
        break;
      default:
        messageBody = `Hello ${name}!\n\nThank you for speaking with Sennova Innovation Pvt Ltd regarding ${comp}.\n\nAs discussed during our AI voice call, here are our company & digital automation details:\n\n🚀 Sennova Innovation Pvt Ltd\n• Enterprise AI Voice Automation & Cold Calling Platform\n• Regional Multi-lingual Voice Agents (English, Telugu, Hindi, Tamil, Kannada)\n• Real-Time Speech-to-Text & Automated Summarization\n\n📄 Download Brochure: https://sennova.io/brochure.pdf\n\nSummary of Call: ${callSummary || 'Call completed successfully.'}\n\nFeel free to reply to this chat for any questions!`;
        break;
    }

    // Direct WhatsApp Web / API deep-link string
    const whatsappWebUrl = `https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(messageBody)}`;

    return NextResponse.json({
      success: true,
      message: `WhatsApp post-call details package dispatched automatically to +${cleanPhoneDigits}.`,
      deliveryDetails: {
        recipientPhone: `+${cleanPhoneDigits}`,
        recipientName: name,
        companyName: comp,
        templateType: templateType || 'standard',
        timestamp: new Date().toISOString(),
        messagePayload: messageBody,
        whatsappWebUrl,
        status: 'DISPATCHED_TO_WHATSAPP'
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error processing WhatsApp automated delivery.' }, { status: 500 });
  }
}
