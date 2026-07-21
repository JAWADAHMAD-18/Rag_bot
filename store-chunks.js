import { readFile } from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbedding } from "./services/embedding.service.js";
import qdrantClient from "./config/qdrant.js";

const COLLECTION_NAME = "rag_learning";

async function main() {
  // Step 1: file load karo
  const text = await readFile("./zalvro-info.txt", "utf-8");

  // Step 2: chunk karo
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });
  const chunks = await splitter.createDocuments([text]);

  console.log(`Total chunks: ${chunks.length}`);

  // Step 3: har chunk ka embedding banao
  const points = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i].pageContent;
    const vector = await getEmbedding(chunkText);

    points.push({
      id: i + 1,
      vector: vector,
      payload: { text: chunkText },
    });
  }

  // Step 4: Qdrant Cloud collection mein daalo
  await qdrantClient.upsert(COLLECTION_NAME, {
    points: points,
  });

  console.log("All chunks are store in Qudrant cloud!");
}

main();