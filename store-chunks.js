import { readFile } from "node:fs/promises";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {
  CONTENT_PAYLOAD_KEY,
  COLLECTION_NAME,
  VECTOR_SIZE,
  qdrantClient,
  vectorStore,
} from "./config/qdrant.js";

async function main() {
  const text = await readFile(new URL("./zalvro-info.txt", import.meta.url), "utf-8");
  const sectionTexts = text.trim().split(/(?=^## )/m).filter(Boolean);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 100,
  });
  const documents = [];

  if (sectionTexts.length === 0 || sectionTexts.some((section) => !section.startsWith("## "))) {
    throw new Error("Knowledge file must contain content organized under ## section headings.");
  }

  for (const sectionText of sectionTexts) {
    const [heading, ...bodyLines] = sectionText.split(/\r?\n/);
    const section = heading.replace(/^##\s+/, "").trim();
    const body = bodyLines.join("\n").trim();
    const chunks = await splitter.createDocuments([body], [{ section }]);

    documents.push(
      ...chunks.map(
        (chunk, index) =>
          new Document({
            pageContent: `${heading}\n${chunk.pageContent}`,
            metadata: { section, sectionChunk: index + 1 },
          }),
      ),
    );
  }

  if (documents.length === 0) {
    throw new Error("No non-empty knowledge sections were found to ingest.");
  }

  await qdrantClient.deleteCollection(COLLECTION_NAME);
  await qdrantClient.createCollection(COLLECTION_NAME, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
  await vectorStore.addDocuments(documents);

  console.log(
    `Recreated ${COLLECTION_NAME} and stored ${documents.length} section-based chunks using payload key "${CONTENT_PAYLOAD_KEY}".`,
  );
}

main().catch((error) => {
  console.error("Knowledge ingestion failed:", error);
  process.exitCode = 1;
});