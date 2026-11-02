// LangChain migration: vectorStore.addDocuments() replaces manual getEmbedding() loop + qdrantClient.upsert()
import { readFile } from "fs/promises";
import qdrantClient, { COLLECTION_NAME, vectorStore } from "./config/qdrant.js";
import { KNOWLEDGE_SOURCE, createKnowledgeChunks } from "./services/knowledge-base.js";

async function main() {
  const text = await readFile(new URL(`./${KNOWLEDGE_SOURCE}`, import.meta.url), "utf-8");
  const chunks = await createKnowledgeChunks(text);

  for (const field_name of ["metadata.source", "metadata.digest"]) {
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name,
      field_schema: "keyword",
      wait: true,
    });
  }
  await qdrantClient.delete(COLLECTION_NAME, {
    filter: { must: [{ key: "metadata.source", match: { value: KNOWLEDGE_SOURCE } }] },
    wait: true,
  });
  console.log(`Total chunks: ${chunks.length}`);

  await vectorStore.addDocuments(chunks);

  console.log("All chunks are stored in Qdrant cloud!");
}

main();