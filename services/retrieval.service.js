import { vectorStore } from "../config/qdrant.js";

const retriever = vectorStore.asRetriever({ k: 5 });

async function retrieveDocuments(query) {
  return retriever.invoke(query);
}

export { retrieveDocuments };