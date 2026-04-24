import { NextResponse } from 'next/server';
import { getCampaigns } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('[campaigns] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar campanhas.' }, { status: 500 });
  }
}
