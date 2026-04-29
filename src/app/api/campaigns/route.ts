import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns } from '@/lib/db';
import { withAuth } from '@/infrastructure/middlewares/auth.middleware';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  try {
    const campaigns = await getCampaigns(user.id);
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('[campaigns] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar campanhas.' }, { status: 500 });
  }
});
