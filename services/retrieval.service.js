// LangChain migration: vectorStore.asRetriever() replaces manual qdrantClient.search() + getEmbedding()
import { vectorStore } from "../config/qdrant.js";

// LangChain migration: asRetriever wraps the vector store in a LangChain Retriever interface
const retriever = vectorStore.asRetriever({ k: 3 });

async function retrieveChunks(query) {
  // LangChain migration: retriever.invoke() replaces manual embedding + qdrantClient.search()
  const docs = await retriever.invoke(query);
  return docs.map((doc) => doc.pageContent);
}

export { retrieveChunks };