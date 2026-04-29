import { NextRequest, NextResponse } from 'next/server';
import { getCampaignStats } from '@/lib/db';
import { withAuth } from '@/infrastructure/middlewares/auth.middleware';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const campaignId = req.nextUrl.pathname.split('/').at(-2)!;
    const stats = await getCampaignStats(campaignId, user.id);

    if (!stats.campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });
    }

    const totalSent = stats.totalSent;
    const openRate = totalSent > 0
      ? ((stats.uniqueOpens / totalSent) * 100).toFixed(1)
      : '0.0';
    const clickRate = totalSent > 0
      ? ((stats.uniqueClicks / totalSent) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({ ...stats, openRate, clickRate });
  } catch (error) {
    console.error('[campaigns/stats] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas.' }, { status: 500 });
  }
});
