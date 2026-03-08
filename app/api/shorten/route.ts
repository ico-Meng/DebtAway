import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('TinyURL request failed');
    const shortened = await response.text();
    return NextResponse.json({ shortened: shortened.trim() });
  } catch {
    return NextResponse.json({ error: 'Failed to shorten URL' }, { status: 500 });
  }
}
