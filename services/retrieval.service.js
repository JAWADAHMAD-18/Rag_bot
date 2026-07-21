import qdrantClient from "../config/qdrant.js";
import { getEmbedding } from "./embedding.service.js";

const COLLECTION_NAME = "rag_learning";

async function retrieveChunks(query, topK = 3) {
  const queryVector = await getEmbedding(query);

  const results = await qdrantClient.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: topK,
  });

  return results.map((r) => r.payload.text);
}

export { retrieveChunks };