import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/renderTemplate";
import { createCampaign, addRecipient } from "@/lib/db";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const FALLBACK_HEADER_URL = "https://newsletterdcp.s3.us-east-2.amazonaws.com/template-resources/header_newsletter.jpg";
const HEADER_S3_URL = process.env.HEADER_IMAGE_URL || FALLBACK_HEADER_URL;

function injectTracking(html, campaignId, recipientId) {
  // Substitui o src do header pela URL de tracking (registra abertura)
  const openUrl = `${BASE_URL}/api/track/open/${campaignId}/${recipientId}`;
  
  let tracked = html;
  if (HEADER_S3_URL && html.includes(HEADER_S3_URL)) {
    tracked = html.replace(HEADER_S3_URL, openUrl);
  } else {
    // Fallback: se não encontrar a imagem para substituir, injeta um pixel invisível
    const pixel = `<img src="${openUrl}" width="1" height="1" style="display:none;" alt="" />`;
    tracked = html.replace('</body>', `${pixel}\n</body>`);
  }

  // Envolve todos os links <a href="http..."> com redirect de tracking
  tracked = tracked.replace(
    /<a\b([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (_, before, originalUrl, after, content) => {
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
    const body = await request.json();
    const { blocks, tracking } = body;

    if (!blocks || blocks.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma seção foi enviada." },
        { status: 400 }
      );
    }

    const hasContent = blocks.some((b) => b.title?.trim() || b.text?.trim());
    if (!hasContent) {
      return NextResponse.json(
        { error: "Preencha pelo menos uma seção antes de gerar." },
        { status: 400 }
      );
    }

    let html = renderTemplate(blocks);

    if (tracking) {
      const { campaignName, subject, recipientEmail, recipientName } = tracking;

      if (!campaignName || !subject || !recipientEmail) {
        return NextResponse.json(
          { error: "Para ativar o tracking, informe nome da campanha, assunto e e-mail do destinatário." },
          { status: 400 }
        );
      }

      const campaignId = crypto.randomUUID();
      const recipientId = crypto.randomUUID();

      await createCampaign(campaignId, campaignName, subject);
      await addRecipient(recipientId, campaignId, recipientEmail, recipientName ?? "");

      html = injectTracking(html, campaignId, recipientId);

      return NextResponse.json({ html, campaignId, recipientId });
    }

    return NextResponse.json({ html });
  } catch (error) {
    console.error("[generate] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o conteúdo." },
      { status: 500 }
    );
  }
}
