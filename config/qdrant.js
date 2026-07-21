import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_CLUSTER,
  apiKey: process.env.QDRANT_API_KEY,
});

export default qdrantClient;