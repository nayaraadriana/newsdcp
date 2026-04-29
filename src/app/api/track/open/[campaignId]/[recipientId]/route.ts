import { NextRequest, NextResponse } from 'next/server';
import { registerOpen } from '@/lib/db';

//export const runtime = 'edge';

const FALLBACK_HEADER_URL = "https://newsletterdcp.s3.us-east-2.amazonaws.com/template-resources/header_newsletter.jpg";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ campaignId: string; recipientId: string }> }
) {
    const { campaignId, recipientId } = await params;
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? '';

    await registerOpen(recipientId, campaignId, ip, userAgent)
        .catch((err) => console.error('[TRACK_OPEN_ERROR]', err));

    const imgParam = req.nextUrl.searchParams.get('img');
    const imageUrl = imgParam ? decodeURIComponent(imgParam) : (process.env.HEADER_IMAGE_URL || FALLBACK_HEADER_URL);

    return NextResponse.redirect(imageUrl, 302);
}