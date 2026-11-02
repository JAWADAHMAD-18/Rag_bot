import { readFile } from "fs/promises";
import { vectorStore } from "../config/qdrant.js";
import { getKnowledgeDigest, KNOWLEDGE_SOURCE } from "./knowledge-base.js";

const knowledgeText = await readFile(new URL(`../${KNOWLEDGE_SOURCE}`, import.meta.url), "utf8");
const knowledgeDigest = getKnowledgeDigest(knowledgeText);
const retriever = vectorStore.asRetriever({
  k: 3,
  filter: {
    must: [
      { key: "metadata.digest", match: { value: knowledgeDigest } },
    ],
  },
});

async function retrieveDocuments(query) {
  try {
    const docs = (await retriever.invoke(query)).filter(
      (doc) => typeof doc.pageContent === "string" && doc.pageContent.trim().length > 0,
    );
    if (docs.length === 0) {
      console.error(`Knowledge retrieval returned no context for query: ${query}`);
    }
    return docs;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Qdrant retrieval failed:", message);
    const retrievalError = new Error(
      "Knowledge retrieval is temporarily unavailable. Please try again shortly.",
    );
    retrievalError.statusCode = 503;
    throw retrievalError;
  }
}

async function retrieveChunks(query) {
  const docs = await retrieveDocuments(query);
  return docs.map((doc) => doc.pageContent);
}

export { retrieveChunks, retrieveDocuments };