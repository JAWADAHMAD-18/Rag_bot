// LangChain migration: custom Embeddings subclass wrapping @xenova/transformers (replaces raw getEmbedding function)
import { pipeline } from "@xenova/transformers";
import { Embeddings } from "@langchain/core/embeddings";

let embedder = null;

async function loadPipeline() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

// LangChain migration: custom class extending Embeddings since no official @langchain package exists for @xenova/transformers
class XenovaEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedQuery(text) {
    const model = await loadPipeline();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  async embedDocuments(documents) {
    const results = [];
    for (const doc of documents) {
      results.push(await this.embedQuery(doc));
    }
    return results;
  }
}

// Singleton instance for use across the app
const embeddings = new XenovaEmbeddings();

// Legacy helper kept for backward compatibility
async function getEmbedding(text) {
  return embeddings.embedQuery(text);
}

export { embeddings, getEmbedding, XenovaEmbeddings };