import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../services/embedding.service.js";

const COLLECTION_NAME = "rag_learning";
const VECTOR_SIZE = 384;
const CONTENT_PAYLOAD_KEY = "text";

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_CLUSTER,
  apiKey: process.env.QDRANT_API_KEY,
});

const vectorStore = new QdrantVectorStore(embeddings, {
  client: qdrantClient,
  collectionName: COLLECTION_NAME,
  contentPayloadKey: CONTENT_PAYLOAD_KEY,
});

export default qdrantClient;
export {
  qdrantClient,
  vectorStore,
  COLLECTION_NAME,
  VECTOR_SIZE,
  CONTENT_PAYLOAD_KEY,
};