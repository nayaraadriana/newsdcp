import { registerTrackedLink } from './db';

/**
 * Gera o HTML da seção de botão e registra o link para tracking.
 *
 * @param {{ buttonStyle: 'large' | 'link', text: string, url: string }} section
 * @param {string} campaignId
 * @returns {Promise<string>} HTML da seção
 */
export async function renderButtonSection(section, campaignId) {
  const trackUrl = await registerTrackedLink(section.url, section.text, campaignId);

  if (section.buttonStyle === 'large') {
    return `
<!-- ============================================================ -->
<!--  BUTTON — Botão grande centralizado                         -->
<!-- ============================================================ -->
<tr>
  <td style="padding: 16px; background-color: #ffffff; text-align: center;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
      <tr>
        <td style="
          background-color: #ff4000;
          border-radius: 8px;
          padding: 14px 32px;
        ">
          <a href="${trackUrl}" target="_blank" style="
            font-family: 'Hotmart Sans', sans-serif;
            font-size: 16px;
            font-weight: 700;
            line-height: 1.5;
            color: #ffffff;
            text-decoration: none;
            display: inline-block;
          ">${section.text}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
  }

  return `
<!-- ============================================================ -->
<!--  BUTTON — Botão link com seta                               -->
<!-- ============================================================ -->
<tr>
  <td style="padding: 12px 16px; background-color: #ffffff; text-align: center;">
    <a href="${trackUrl}" target="_blank" style="
      font-family: 'Hotmart Sans', sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
      color: #ff4000;
      text-decoration: underline;
    ">${section.text} →</a>
  </td>
</tr>`;
}
