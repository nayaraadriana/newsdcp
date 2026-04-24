import { NextRequest } from 'next/server';
import { registerOpen } from '@/lib/db';

//export const runtime = 'edge';

const HEADER_IMAGE_URL = process.env.HEADER_IMAGE_URL!;

export async function GET(
    req: NextRequest,
    { params }: { params: { campaignId: string; recipientId: string } }
) {
    const { campaignId, recipientId } = params;
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? '';

    registerOpen(recipientId, campaignId, ip, userAgent)
        .catch((err) => console.error('[TRACK_OPEN_ERROR]', err));

    const imageResponse = await fetch(HEADER_IMAGE_URL, {
        cache: 'no-store',
    });

    if (!imageResponse.ok) {
        return new Response('Image not found', { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') ?? 'image/png';

    return new Response(imageBuffer, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}