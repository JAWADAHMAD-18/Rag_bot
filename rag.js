// LangChain migration: full LCEL chain replaces manual retrieve → build prompt → fetch Groq pattern
import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { vectorStore } from "./config/qdrant.js";

// LangChain migration: ChatGroq replaces raw fetch() to Groq REST API
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
});

// LangChain migration: asRetriever() replaces manual getEmbedding + qdrantClient.search
const retriever = vectorStore.asRetriever({ k: 3 });

// LangChain migration: PromptTemplate replaces manual template-literal prompt string
const prompt = PromptTemplate.fromTemplate(
  `You are Zalvro's assistant, a web development and AI automation agency. 
Respond naturally to greetings and small talk. 
For any question about Zalvro's services, pricing, process, or portfolio, answer ONLY using the context provided below.
If someone asks something unrelated to Zalvro (like general knowledge questions), politely say you can only help with questions about Zalvro's services, and redirect them.

Context:
{context}

Question: {question}

Answer:`
);

// LangChain migration: LCEL RunnableSequence replaces manual 3-step retrieve → prompt → generate flow
const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  llm,
  new StringOutputParser(),
]);

// Step 3: Poora RAG loop — ab LCEL chain invoke karo
async function askRAG(query) {
  console.log(`\n=== Question: ${query} ===`);

  // LangChain migration: single chain.invoke() replaces manual retrieveChunks + generateAnswer
  const answer = await ragChain.invoke(query);
  console.log("\nAnswer:", answer);
}

// Test karo
await askRAG("How much does a website cost?");
await askRAG("What industries does Zalvro work with?");
await askRAG("Can you help redesign my existing site?"); // ye document mein nahi hai, dekhte hain kya kehta hai
