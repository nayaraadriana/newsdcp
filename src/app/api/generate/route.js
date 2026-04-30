import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/renderTemplate";
import { createCampaign, addRecipient } from "@/lib/db";
import { auth } from "@/infrastructure/auth/better-auth.server";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

function injectTracking(html, campaignId, recipientId) {
  let tracked = html;

  // Envolve links externos com redirect de tracking (ignora URLs internas já rastreadas)
  tracked = tracked.replace(
    /<a\b([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, before, originalUrl, after, content) => {
      if (originalUrl.includes('/api/track/')) return match;
      const label = content.replace(/<[^>]+>/g, "").trim();
      const encodedUrl = encodeURIComponent(originalUrl);
      const encodedLabel = encodeURIComponent(label);
      const trackUrl = `${BASE_URL}/api/track/click/${campaignId}/${recipientId}?url=${encodedUrl}&label=${encodedLabel}`;
      return `<a${before}href="${trackUrl}"${after}>${content}</a>`;
    }
  );

  return tracked;
}

export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { blocks, tracking, surveyUrl, signaturePhotoUrl, headerImageUrl } = body;

    if (!blocks || blocks.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma seção foi enviada." },
        { status: 400 }
      );
    }

    const hasContent = blocks.some((b) => b.title?.trim() || b.text?.trim() || (b.type === "button" && b.url?.trim()));
    if (!hasContent) {
      return NextResponse.json(
        { error: "Preencha pelo menos uma seção antes de gerar." },
        { status: 400 }
      );
    }

    if (tracking) {
      const { campaignName, subject } = tracking;

      if (!campaignName || !subject) {
        return NextResponse.json(
          { error: "Para ativar o tracking, informe nome da campanha e assunto." },
          { status: 400 }
        );
      }

      const campaignId = crypto.randomUUID();
      const recipientId = crypto.randomUUID();

      await createCampaign(campaignId, campaignName, subject, userId);
      await addRecipient(recipientId, campaignId, "", "");

      const html = injectTracking(
        await renderTemplate(blocks, campaignId, surveyUrl, signaturePhotoUrl, headerImageUrl, recipientId),
        campaignId,
        recipientId
      );

      return NextResponse.json({ html, campaignId, recipientId });
    }

    const html = await renderTemplate(blocks, null, surveyUrl, signaturePhotoUrl, headerImageUrl);
    return NextResponse.json({ html });
  } catch (error) {
    console.error("[generate] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o conteúdo." },
      { status: 500 }
    );
  }
}
