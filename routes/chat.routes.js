import express from "express";
import { execFileSync } from "child_process";
import { readFile } from "fs/promises";
import qdrantClient, { COLLECTION_NAME } from "../config/qdrant.js";
import { handleChat } from "../controllers/chat.controller.js";
import { retrieveDocuments } from "../services/retrieval.service.js";
import { createKnowledgeChunks } from "../services/knowledge-base.js";

const router = express.Router();

router.post("/chat", handleChat);

router.get("/debug/status", async (req, res) => {
  if (!process.env.DEBUG_TOKEN || req.get("x-debug-token") !== process.env.DEBUG_TOKEN) {
    return res.sendStatus(404);
  }

  try {
    const host = new URL(process.env.QDRANT_CLUSTER).hostname;
    const [commit, count, sample, knowledgeText] = await Promise.all([
      process.env.RENDER_GIT_COMMIT ||
        execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
      qdrantClient.count(COLLECTION_NAME, { exact: true }),
      qdrantClient.scroll(COLLECTION_NAME, {
        limit: 2,
        with_payload: true,
        with_vector: false,
      }),
      readFile(new URL("../zalvro-info.txt", import.meta.url), "utf8"),
    ]);
    const points = sample.points || [];
    const payloadKeys = points.map((point) => Object.keys(point.payload || {}));
    const firstPayload = points[0]?.payload || {};
    const firstText = firstPayload.pageContent ?? firstPayload.text ?? firstPayload.content;
    const chunks = await createKnowledgeChunks(knowledgeText);
    const debugQueries = [
      "how can I contact you",
      "what services do you provide",
    ];
    const topK = {};

    for (const query of debugQueries) {
      const documents = await retrieveDocuments(query);
      topK[query] = documents.map((document) => {
        const text = document.pageContent.trim();
        const heading = document.metadata.heading
          || text.match(/^#{1,3}\s+.+/m)?.[0]
          || text.split(/\r?\n/, 1)[0].slice(0, 80);
        return { heading, preview: text.slice(0, 80) };
      });
    }

    return res.json({
      commit,
      qdrant: {
        collection: COLLECTION_NAME,
        host,
        pointCount: count.count,
        samplePayloadKeys: payloadKeys,
        firstPointTextNonEmpty: typeof firstText === "string" && firstText.trim().length > 0,
      },
      groqModels: ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"],
      knowledgeChunkCount: chunks.length,
      topK,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Debug status request failed:", message);
    return res.status(500).json({ error: "Unable to collect debug status." });
  }
});

export default router;