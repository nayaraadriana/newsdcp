import { registerTrackedLink } from './db';

/**
 * Gera o HTML do botão e registra o link para tracking.
 *
 * @param {{ buttonStyle: 'large' | 'link', buttonText?: string, buttonUrl?: string }} section
 * @param {string|null} campaignId
 * @param {string} [sectionBg='#ffffff'] cor de fundo da seção pai
 * @returns {Promise<string>} HTML do botão (rows de tabela)
 */
export async function renderButtonSection(section, campaignId, sectionBg = '#ffffff') {
  const label = section.buttonText ?? section.text ?? '';
  const href = section.buttonUrl ?? section.url ?? '';

  const trackUrl = campaignId
    ? await registerTrackedLink(href, label, campaignId)
    : href;

  if (section.buttonStyle === 'large') {
    return `
<tr>
  <td style="padding: 16px; background-color: ${sectionBg}; text-align: center;">
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
          ">${label}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
  }

  return `
<tr>
  <td style="padding: 12px 16px; background-color: ${sectionBg}; text-align: center;">
    <a href="${trackUrl}" target="_blank" style="
      font-family: 'Hotmart Sans', sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
      color: #ff4000;
      text-decoration: underline;
    ">${label} →</a>
  </td>
</tr>`;
}
