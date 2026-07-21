import { pipeline } from "@xenova/transformers";
import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

const client = new QdrantClient({
  url: process.env.QDRANT_CLUSTER,
  apiKey: process.env.QDRANT_API_KEY,
});

let embedder = null;
async function getEmbedding(text) {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

// Step 1: Retrieval — jaisa Day 4 mein kiya tha
async function retrieveChunks(query, topK = 3) {
  const queryVector = await getEmbedding(query);
  const results = await client.search("rag_learning", {
    vector: queryVector,
    limit: topK,
  });
  return results.map((r) => r.payload.text);
}

// Step 2: Groq ko context + question bhej ke answer generate karo
async function generateAnswer(query, chunks) {
  const context = chunks.join("\n\n");

  const prompt = `You are Zalvro's assistant, a web development and AI automation agency. 
Respond naturally to greetings and small talk. 
For any question about Zalvro's services, pricing, process, or portfolio, answer ONLY using the context provided below.
If someone asks something unrelated to Zalvro (like general knowledge questions), politely say you can only help with questions about Zalvro's services, and redirect them.

Context:
${context}

Question: ${query}

Answer:`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    },
  );

  const data = await response.json();
  return data.choices[0].message.content;
}

// Step 3: Poora RAG loop — ek function mein combine karo
async function askRAG(query) {
  console.log(`\n=== Question: ${query} ===`);

  const chunks = await retrieveChunks(query);
  console.log("Retrieved chunks:", chunks.length);

  const answer = await generateAnswer(query, chunks);
  console.log("\nAnswer:", answer);
}

// Test karo
await askRAG("How much does a website cost?");
await askRAG("What industries does Zalvro work with?");
await askRAG("Can you help redesign my existing site?"); // ye document mein nahi hai, dekhte hain kya kehta hai
