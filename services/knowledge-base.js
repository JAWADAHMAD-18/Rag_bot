import { createHash } from "crypto";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const KNOWLEDGE_SOURCE = "zalvro-info.txt";
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

function getKnowledgeDigest(text) {
  return createHash("sha256")
    .update("zalvro-info:section-headings-v1\n")
    .update(text)
    .digest("hex");
}

async function createKnowledgeChunks(text) {
  const digest = getKnowledgeDigest(text);
  const sections = text.split(/(?=^## )/m).filter((section) => section.trim());
  return splitter.createDocuments(
    sections,
    sections.map((section) => ({
      source: KNOWLEDGE_SOURCE,
      digest,
      heading: section.match(/^## .+/m)?.[0] || "## General",
    })),
  );
}

export { KNOWLEDGE_SOURCE, createKnowledgeChunks, getKnowledgeDigest };
