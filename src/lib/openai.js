/**
 * 🟡 Chamada real à OpenAI — implementar quando a chave estiver disponível.
 * Por enquanto este arquivo está vazio e a rota usa o mockAI.js.
 *
 * Para ativar:
 * 1. Adicione OPENAI_API_KEY no arquivo .env.local
 * 2. Instale o SDK: npm install openai
 * 3. Implemente a função abaixo e troque a importação no route.js
 */

// import OpenAI from "openai";

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * @param {string} text - Texto bruto da newsletter
 * @returns {Promise<Object>} JSON com os campos do template preenchidos
 */
export async function generateJSON(text) {
  // TODO: implementar chamada real
  throw new Error("OpenAI ainda não configurado. Use mockAI.js por enquanto.");
}
