import { NextRequest, NextResponse } from 'next/server';
import { createCampaign, registerTrackedLink } from '@/lib/db';
import { withAuth } from '@/infrastructure/middlewares/auth.middleware';
import { randomUUID } from 'crypto';

interface LinkInput {
  label: string;
  url: string;
}

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const { campaignName, links } = body as { campaignName: string; links: LinkInput[] };

    if (!campaignName?.trim()) {
      return NextResponse.json({ error: 'Nome da campanha é obrigatório.' }, { status: 400 });
    }

    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ error: 'Adicione ao menos um link.' }, { status: 400 });
    }

    const invalidLinks = links.filter((l) => !l.url?.trim() || !l.label?.trim());
    if (invalidLinks.length > 0) {
      return NextResponse.json(
        { error: 'Todos os links precisam ter nome e URL preenchidos.' },
        { status: 400 }
      );
    }

    // Create the campaign (subject = campaignName for link-only campaigns)
    const campaignId = randomUUID();
    await createCampaign(campaignId, campaignName.trim(), campaignName.trim(), user.id);

    // Register each tracked link
    const trackedLinks = await Promise.all(
      links.map(async (link) => {
        const trackedUrl = await registerTrackedLink(link.url.trim(), link.label.trim(), campaignId);
        return {
          label: link.label.trim(),
          originalUrl: link.url.trim(),
          trackedUrl,
        };
      })
    );

    return NextResponse.json({ campaignId, trackedLinks });
  } catch (error) {
    console.error('[links/generate] Erro:', error);
    return NextResponse.json({ error: 'Erro ao gerar links rastreáveis.' }, { status: 500 });
  }
});
