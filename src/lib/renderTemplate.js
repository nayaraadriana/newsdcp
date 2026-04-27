import fs from "fs";
import path from "path";
import { renderButtonSection } from "./renderButtonSection";

const TEMPLATES_DIR = path.join(process.cwd(), "src", "templates");
const PARTIALS_DIR = path.join(TEMPLATES_DIR, "partials");

/** Lê um arquivo de partial e retorna seu conteúdo */
function readPartial(name) {
  return fs.readFileSync(path.join(PARTIALS_DIR, name), "utf-8");
}

/** Substitui todos os {{PLACEHOLDER}} em uma string pelos valores do objeto data */
function inject(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
}

/** Converte texto plano com quebras de linha ou listas em HTML */
function formatText(text, style = "") {
  if (!text) return "";
  const lines = text.split("\n");
  const result = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    result.push(`<ul style="margin:4px 0;padding-left:20px;">${listItems.join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    if (/^[-*]\s+/.test(line.trim())) {
      listItems.push(`<li style="margin:0 0 4px 0;${style}">${line.trim().replace(/^[-*]\s+/, "")}</li>`);
    } else {
      flushList();
      result.push(line);
    }
  }
  flushList();

  return result.join("<br>");
}

/**
 * Banner do bloco Highlights — exibido apenas antes do primeiro highlight.
 * Fica como constante inline para não precisar de um arquivo extra.
 */
const HIGHLIGHTS_BANNER = `
<tr>
  <td style="padding: 0; background-color:#0D0D0D;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 8px;">
          <img src="https://newsletterdcp.s3.us-east-2.amazonaws.com/template-resources/highlights.png"
            alt="Highlights" width="100%" style="display:block; border:0; max-width:100%; height:auto;">
        </td>
      </tr>
    </table>
  </td>
</tr>`;

/**
 * Monta o HTML final a partir da lista de blocos selecionados pelo usuário.
 *
 * @param {Array<{type: string, title: string, text: string, imageUrl?: string}>} blocks
 * @param {string | null} campaignId
 * @returns {Promise<string>} HTML completo da newsletter
 */
export async function renderTemplate(blocks, campaignId = null) {
  const wrapper = fs.readFileSync(
    path.join(TEMPLATES_DIR, "newsletter.html"),
    "utf-8"
  );

  const highlightPartial = readPartial("highlight.html");
  // Cores de fundo alternadas para os highlights (zebra)
  const highlightBgColors = ["#0D0D0D", "#0D0D0D"];

  let sections = "";
  // Controla se o banner de Highlights já foi inserido
  let highlightBannerInserted = false;
  let highlightIndex = 0;

  // Header e Footer são sempre incluídos
  sections += readPartial("header.html");

  for (const block of blocks) {
    switch (block.type) {
      case "intro":
        sections += inject(readPartial("intro.html"), {
          TITULO_INTRO: block.title,
          TEXTO_INTRO: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
        });
        break;

      case "hero":
        sections += inject(readPartial("hero.html"), {
          IMAGEM_HERO: block.imageUrl || "",
          TITULO_HERO: block.title,
          TEXTO_HERO: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
        });
        break;

      case "highlight": {
        const bgColor = highlightBgColors[highlightIndex % 2];
        const banner = highlightBannerInserted ? "" : HIGHLIGHTS_BANNER;
        highlightBannerInserted = true;
        highlightIndex++;

        let rendered = highlightPartial.replace("{{HIGHLIGHT_BANNER}}", banner);
        rendered = inject(rendered, {
          TITULO_HIGHLIGHT: block.title,
          TEXTO_HIGHLIGHT: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:#ffffff;"),
          BG_COLOR: bgColor,
        });
        sections += rendered;
        break;
      }

      case "content": {
        const imageBlock = block.imageUrl
          ? `<img src="${block.imageUrl}" alt="${block.title}" width="504" style="width:100%;max-width:504px;height:auto;border-radius:8px;display:block;margin:20px auto 0 auto;">`
          : "";
        sections += inject(readPartial("content.html"), {
          TITULO_CONTENT: block.title,
          TEXTO_CONTENT: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
          IMAGEM_CONTENT_BLOCK: imageBlock,
        });
        break;
      }

      case "fique_de_olho":
        sections += inject(readPartial("fique_de_olho.html"), {
          TITULO_FIQUE_DE_OLHO: block.title,
          TEXTO_FIQUE_DE_OLHO: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
        });
        break;

      case "button":
        sections += await renderButtonSection(block, campaignId);
        break;

      default:
        console.warn(`[renderTemplate] Tipo de bloco desconhecido: ${block.type}`);
    }
  }

  sections += readPartial("footer.html");

  return wrapper.replace("{{SECTIONS}}", sections);
}
