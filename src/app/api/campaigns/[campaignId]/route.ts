import { NextRequest, NextResponse } from 'next/server';
import { deleteCampaign } from '@/lib/db';
import { withAuth } from '@/infrastructure/middlewares/auth.middleware';

export const DELETE = withAuth(async (req: NextRequest, { user }) => {
  try {
    const campaignId = req.nextUrl.pathname.split('/').at(-1)!;
    const deleted = await deleteCampaign(campaignId, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Campanha não encontrada ou sem permissão.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[campaigns/delete] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir campanha.' },
      { status: 500 }
    );
  }
});
