// LangChain migration: vectorStore.addDocuments() replaces manual getEmbedding() loop + qdrantClient.upsert()
import { readFile } from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "./config/qdrant.js";

const COLLECTION_NAME = "rag_learning";

async function main() {
  // Step 1: file load karo
  const text = await readFile("./zalvro-info.txt", "utf-8");

  // Step 2: chunk karo
  // LangChain migration: RecursiveCharacterTextSplitter kept (was already LangChain), chunkSize updated to ~500
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const chunks = await splitter.createDocuments([text]);

  console.log(`Total chunks: ${chunks.length}`);

  // LangChain migration: addDocuments replaces manual for-loop of getEmbedding + qdrantClient.upsert
  await vectorStore.addDocuments(chunks);

  console.log("All chunks are store in Qudrant cloud!");
}

main();