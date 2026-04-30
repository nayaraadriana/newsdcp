import { NextRequest, NextResponse } from 'next/server';
import { registerOpen } from '@/lib/db';

export const runtime = 'edge';

// GIF transparente 1x1 px (35 bytes)
const PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ campaignId: string; recipientId: string }> }
) {
    const { campaignId, recipientId } = await params;
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? '';

    registerOpen(recipientId, campaignId, ip, userAgent)
        .catch((err) => console.error('[TRACK_OPEN_ERROR]', err));

    return new NextResponse(PIXEL, {
        status: 200,
        headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    });
}
