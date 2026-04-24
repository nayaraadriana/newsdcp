import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
) {
    const { linkId } = await params;
    const ip = req.headers.get('x-forwarded-for') ?? '';
    const userAgent = req.headers.get('user-agent') ?? '';

    const rows = await sql`
        SELECT original_url, campaign_id, label FROM tracked_links WHERE id = ${linkId} LIMIT 1
    `;

    if (!rows.length) {
        return NextResponse.redirect(new URL('/', req.url), 302);
    }

    const { original_url, campaign_id, label } = rows[0];

    await sql`
        INSERT INTO clicks (recipient_id, campaign_id, original_url, link_label, ip_address, user_agent)
        VALUES (${null}, ${campaign_id}, ${original_url}, ${label}, ${ip}, ${userAgent})
    `.catch((err) => console.error('[TRACK_LINK_ERROR]', err));

    return NextResponse.redirect(original_url, 302);
}
