import { NextRequest, NextResponse } from 'next/server';
import { registerClick } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ campaignId: string; recipientId: string }> }
) {
    const { campaignId, recipientId } = await params;
    const rawUrl = req.nextUrl.searchParams.get('url');
    const label = req.nextUrl.searchParams.get('label') ?? '';
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? '';

    if (!rawUrl) {
        return NextResponse.json({ error: 'URL não informada' }, { status: 400 });
    }

    const originalUrl = decodeURIComponent(rawUrl);
    const linkLabel = decodeURIComponent(label);

    await registerClick(recipientId, campaignId, originalUrl, linkLabel, ip, userAgent)
        .catch((err) => console.error('[TRACK_CLICK_ERROR]', err));

    return NextResponse.redirect(originalUrl, 302);
}