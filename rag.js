import "dotenv/config";
import { answerQuestion } from "./services/groq.service.js";

async function askRAG(query) {
  console.log(`\n=== Question: ${query} ===`);
  const answer = await answerQuestion(query);
  console.log("\nAnswer:", answer);
}

await askRAG("How does pricing work for a website?");
await askRAG("What industries does Zalvro work with?");
await askRAG("Can you help redesign my existing site?");
