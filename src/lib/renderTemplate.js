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

/**
 * Banner do bloco Highlights — exibido apenas antes do primeiro highlight.
 * Fica como constante inline para não precisar de um arquivo extra.
 */
const HIGHLIGHTS_BANNER = `
<tr>
  <td style="padding: 0; background-color:#ffffff;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="left" style="background-color: #ff4000; padding: 16px;">
          <span style="
            display: inline-flex; align-items: center; gap: 8px;
            font-family: 'Hotmart Sans', sans-serif;
            font-size: 18px; font-weight: 700; line-height: 1.5;
            color: #ffffff; letter-spacing: 2px; text-transform: uppercase;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"
              style="display:inline-block; vertical-align:middle; flex-shrink:0;">
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
              <path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>
            </svg>
            Highlights
          </span>
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
  const highlightBgColors = ["#ffffff", "#f5f3ef"];

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
          TEXTO_INTRO: block.text,
        });
        break;

      case "hero":
        sections += inject(readPartial("hero.html"), {
          IMAGEM_HERO: block.imageUrl || "",
          TITULO_HERO: block.title,
          TEXTO_HERO: block.text,
        });
        break;

      case "highlight": {
        const bgColor = highlightBgColors[highlightIndex % 2];
        const banner = highlightBannerInserted ? "" : HIGHLIGHTS_BANNER;
        highlightBannerInserted = true;
        highlightIndex++;

        // Injeta o banner (só no primeiro) e os dados do highlight
        let rendered = highlightPartial.replace("{{HIGHLIGHT_BANNER}}", banner);
        rendered = inject(rendered, {
          TITULO_HIGHLIGHT: block.title,
          TEXTO_HIGHLIGHT: block.text,
          BG_COLOR: bgColor,
        });
        sections += rendered;
        break;
      }

      case "fique_de_olho":
        sections += inject(readPartial("fique_de_olho.html"), {
          TITULO_FIQUE_DE_OLHO: block.title,
          TEXTO_FIQUE_DE_OLHO: block.text,
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
