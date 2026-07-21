import qdrantClient from "./qdrant.js";

async function main() {
  try {
    const result = await qdrantClient.createCollection("rag_learning", {
      vectors: { size: 384, distance: "Cosine" },
    });
    console.log("Collection ban gayi cloud pe! Result:", result);
  } catch (err) {
    console.error("Error:", err.message || err);
  }
}

main();