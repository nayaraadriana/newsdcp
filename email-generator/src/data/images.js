/**
 * Lista de URLs das imagens disponíveis no S3 para o hero da newsletter.
 * Use estas URLs no campo IMAGEM_HERO ao gerar o JSON.
 */
export const heroImages = [
  {
    id: "placeholder",
    url: "https://newsletterdcp.s3.us-east-2.amazonaws.com/template-resources/hero_placeholder.jpg",
    description: "Imagem placeholder padrão",
  },
  // Adicione mais imagens conforme forem enviadas ao S3:
  // {
  //   id: "abril-2026",
  //   url: "https://newsletterdcp.s3.us-east-2.amazonaws.com/edicao-abril-2026/hero.jpg",
  //   description: "Hero da edição de Abril/2026",
  // },
];

/**
 * Retorna a URL de uma imagem pelo ID, ou a primeira disponível como fallback.
 *
 * @param {string} id
 * @returns {string} URL da imagem
 */
export function getImageUrl(id) {
  const found = heroImages.find((img) => img.id === id);
  return found ? found.url : heroImages[0].url;
}
