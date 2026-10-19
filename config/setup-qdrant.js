import qdrantClient, { COLLECTION_NAME, VECTOR_SIZE } from "./qdrant.js";

async function main() {
  const result = await qdrantClient.createCollection(COLLECTION_NAME, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
  console.log("Collection created:", result);
}

main().catch((error) => {
  console.error("Could not create the Qdrant collection:", error);
  process.exitCode = 1;
});