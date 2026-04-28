import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function embedText(input: string) {
  const openai = getOpenAI();
  if (!openai) {
    return deterministicEmbedding(input);
  }

  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });

  return result.data[0].embedding;
}

function deterministicEmbedding(input: string) {
  const values = new Array<number>(1536).fill(0);
  for (let index = 0; index < input.length; index += 1) {
    const slot = input.charCodeAt(index) % values.length;
    values[slot] += ((input.charCodeAt(index) % 31) + 1) / 31;
  }
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)) || 1;
  return values.map((value) => value / magnitude);
}
