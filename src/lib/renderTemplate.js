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

/** Converte sintaxe [texto](url) em links HTML inline */
function parseInlineLinks(text, linkStyle = "") {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label, url) => {
    return `<a href="${url}" target="_blank" style="color:inherit;text-decoration:underline;${linkStyle}">${label}</a>`;
  });
}

/** Converte texto plano com quebras de linha ou listas em HTML */
function formatText(text, style = "") {
  if (!text) return "";
  const lines = text.split("\n");
  const result = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    result.push(`<ul style="margin:4px 0;padding-left:20px;${style}">${listItems.join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    if (/^[-*]\s+/.test(line.trim())) {
      const content = parseInlineLinks(line.trim().replace(/^[-*]\s+/, ""));
      listItems.push(`<li style="margin:0 0 4px 0;${style}">${content}</li>`);
    } else {
      flushList();
      const content = parseInlineLinks(line);
      result.push(content ? `<span style="${style}">${content}</span>` : "");
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
const DEFAULT_SURVEY_URL = "https://forms.gle/Ae3pv5jWgzaAtCt28";
const DEFAULT_SIGNATURE_PHOTO = "https://newsletterdcp.s3.us-east-2.amazonaws.com/template-resources/assinatura_DCP.png";

export async function renderTemplate(blocks, campaignId = null, surveyUrl = null, signaturePhotoUrl = null, headerImageUrl = null, recipientId = null, baseUrl = "") {
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

  // Injeta o header de imagem full-width quando uma URL for fornecida
  if (headerImageUrl?.trim()) {
    const finalHeaderImageUrl = headerImageUrl.trim();
    sections += inject(readPartial("header.html"), {
      HEADER_IMAGE_URL: finalHeaderImageUrl,
    });
  }

  for (const block of blocks) {
    // Reseta o banner de highlights quando um bloco não-highlight aparece,
    // para que o próximo grupo de highlights receba seu próprio header.
    if (block.type !== "highlight") {
      highlightBannerInserted = false;
      highlightIndex = 0;
    }

    switch (block.type) {
      case "intro":
        sections += inject(readPartial("intro.html"), {
          TITULO_INTRO: block.title,
          TEXTO_INTRO: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
        });
        break;

      case "hero": {
        const imagePosition = block.imagePosition || "above";
        const heroImageHtml = block.imageUrl
          ? `<div style="text-align: center;">
              <img class="hero-img" src="${block.imageUrl}" alt="${block.title}" width="600" style="width:100%;max-width:600px;height:auto;border-radius:8px;display:block;margin:0 auto 16px auto;" />
            </div>`
          : "";
        sections += inject(readPartial("hero.html"), {
          IMAGEM_HERO_ABOVE: imagePosition === "above" ? heroImageHtml : "",
          IMAGEM_HERO_BELOW: imagePosition === "below" ? heroImageHtml : "",
          TITULO_HERO: block.title,
          TEXTO_HERO: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
        });
        break;
      }

      case "highlight": {
        const bgColor = highlightBgColors[highlightIndex % 2];
        const banner = highlightBannerInserted ? "" : HIGHLIGHTS_BANNER;
        highlightBannerInserted = true;
        highlightIndex++;

        const imagePosition = block.imagePosition || "above";
        const imageHighlight = block.imageUrl
          ? `<tr><td style="padding: 8px 16px 0 16px; background-color: ${bgColor};"><img src="${block.imageUrl}" alt="${block.title}" width="100%" style="width:100%;height:auto;border-radius:8px;display:block;"></td></tr>`
          : "";

        let rendered = highlightPartial.replace("{{HIGHLIGHT_BANNER}}", banner);
        rendered = inject(rendered, {
          TITULO_HIGHLIGHT: block.title,
          TEXTO_HIGHLIGHT: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#ffffff;"),
          BG_COLOR: bgColor,
          IMAGEM_HIGHLIGHT_ABOVE: imagePosition === "above" ? imageHighlight : "",
          IMAGEM_HIGHLIGHT_BELOW: imagePosition === "below" ? imageHighlight : "",
        });
        sections += rendered;
        break;
      }

      case "content": {
        const imagePosition = block.imagePosition || "above";
        const imageBlock = block.imageUrl
          ? `<tr><td style="padding: 0 16px 16px 16px; background-color: #ffffff;"><img src="${block.imageUrl}" alt="${block.title}" width="504" style="width:100%;max-width:504px;height:auto;border-radius:8px;display:block;"></td></tr>`
          : "";
        sections += inject(readPartial("content.html"), {
          TITULO_CONTENT: block.title,
          TEXTO_CONTENT: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
          IMAGEM_CONTENT_ABOVE: imagePosition === "above" ? imageBlock : "",
          IMAGEM_CONTENT_BELOW: imagePosition === "below" ? imageBlock : "",
        });
        break;
      }

      case "fique_de_olho": {
        const imagePosition = block.imagePosition || "above";
        const imageFiqueDeOlho = block.imageUrl
          ? `<tr><td style="padding: 8px 16px 0 16px; background-color: #eae9e7;"><img src="${block.imageUrl}" alt="${block.title}" width="100%" style="width:100%;height:auto;border-radius:8px;display:block;"></td></tr>`
          : "";
        sections += inject(readPartial("fique_de_olho.html"), {
          TITULO_FIQUE_DE_OLHO: block.title,
          TEXTO_FIQUE_DE_OLHO: formatText(block.text, "font-family:'Hotmart Sans',sans-serif;font-size:16px;font-weight:400;line-height:1.6;color:#0d0d0d;"),
          IMAGEM_FIQUE_DE_OLHO_ABOVE: imagePosition === "above" ? imageFiqueDeOlho : "",
          IMAGEM_FIQUE_DE_OLHO_BELOW: imagePosition === "below" ? imageFiqueDeOlho : "",
        });
        break;
      }

      case "divider": {
        sections += `<tr><td style="padding: 0 16px; background-color: #ffffff;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0;"></td></tr>`;
        break;
      }

      default:
        console.warn(`[renderTemplate] Tipo de bloco desconhecido: ${block.type}`);
    }

    if (block.buttonEnabled && block.buttonUrl) {
      const sectionBgMap = {
        highlight: "#0D0D0D",
        fique_de_olho: "#eae9e7",
      };
      sections += await renderButtonSection(block, campaignId, sectionBgMap[block.type]);
    }
  }

  const trackingPixel = (campaignId && recipientId)
    ? `<img src="${baseUrl}/api/track/open/${campaignId}/${recipientId}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="">`
    : "";

  sections += inject(readPartial("footer.html"), {
    SURVEY_URL: surveyUrl || DEFAULT_SURVEY_URL,
    SIGNATURE_PHOTO_URL: signaturePhotoUrl || DEFAULT_SIGNATURE_PHOTO,
    thankyou: trackingPixel,
  });

  return wrapper.replace("{{SECTIONS}}", sections);
}
