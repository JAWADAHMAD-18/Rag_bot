// LangChain migration: QdrantVectorStore from @langchain/qdrant replaces raw QdrantClient for vector search
import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../services/embedding.service.js";

const COLLECTION_NAME = "rag_learning";

// Raw client kept for setup-qdrant.js (one-time collection creation)
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_CLUSTER,
  apiKey: process.env.QDRANT_API_KEY,
});

// LangChain migration: QdrantVectorStore.fromExistingCollection replaces raw QdrantClient for search/upsert
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_CLUSTER,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName: COLLECTION_NAME,
});

export default qdrantClient;
export { vectorStore, COLLECTION_NAME };