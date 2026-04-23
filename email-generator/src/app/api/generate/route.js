import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/renderTemplate";

export async function POST(request) {
  try {
    const body = await request.json();
    const { blocks } = body;

    if (!blocks || blocks.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma seção foi enviada." },
        { status: 400 }
      );
    }

    const hasContent = blocks.some(
      (b) => b.title?.trim() || b.text?.trim()
    );
    if (!hasContent) {
      return NextResponse.json(
        { error: "Preencha pelo menos uma seção antes de gerar." },
        { status: 400 }
      );
    }

    // renderTemplate agora recebe o array de blocks diretamente
    const html = renderTemplate(blocks);

    return NextResponse.json({ html });
  } catch (error) {
    console.error("[generate] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o conteúdo." },
      { status: 500 }
    );
  }
}