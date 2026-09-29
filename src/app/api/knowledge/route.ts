import { NextResponse } from 'next/server';
import { INITIAL_KNOWLEDGE } from '@/lib/store';
import { KnowledgeArticle } from '@/lib/types';

let kbData: KnowledgeArticle[] = [...INITIAL_KNOWLEDGE];

export async function GET() {
  return NextResponse.json({ success: true, articles: kbData });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, content } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ success: false, error: 'Category, Title, and Content are required.' }, { status: 400 });
    }

    const newArticle: KnowledgeArticle = {
      id: `kb-${Date.now()}`,
      category,
      title,
      content,
      updatedBy: 'Admin User',
      updatedAt: new Date().toISOString(),
      approved: true
    };

    kbData.unshift(newArticle);

    return NextResponse.json({
      success: true,
      message: 'Knowledge Base article created and approved.',
      article: newArticle
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
