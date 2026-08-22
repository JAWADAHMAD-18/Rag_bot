// LangChain migration: ChatGroq from @langchain/groq replaces raw fetch() to Groq REST API
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";

// LangChain migration: ChatGroq instance replaces manual fetch + JSON.stringify
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

async function generateAnswer(query, chunks) {
  const context = chunks.join("\n\n");

  const prompt = `You are Zalvro's assistant, a web development and AI automation agency.
Respond naturally to greetings and small talk.
For any question about Zalvro's services, pricing, process, or portfolio, answer ONLY using the context provided below.
If someone asks something unrelated to Zalvro, politely say you can only help with questions about Zalvro's services, and redirect them.

Context:
${context}

Question: ${query}

Answer:`;

  // LangChain migration: llm.invoke() replaces manual fetch + response.json() + data.choices[0].message.content
  const response = await llm.invoke([new HumanMessage(prompt)]);
  return response.content;
}

export { generateAnswer, llm };