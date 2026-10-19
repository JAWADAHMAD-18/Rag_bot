import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { retrieveDocuments } from "./retrieval.service.js";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxTokens: 250,
});

const CONTACT_PAGE_URL = "https://zalvrohq.com/contact";
const CONTACT_EMAIL = "contact@zalvrohq.com";
const WHATSAPP_URL = "https://wa.me/923039245454";

const rewritePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Rewrite the latest user message as a standalone question using the conversation history only to resolve references and omitted details. Preserve the user's language (English or Roman Urdu). Do not answer the question or add assumptions. If it is already standalone, return it unchanged. Output only the rewritten question.",
  ],
  new MessagesPlaceholder("history"),
  ["human", "{question}"],
]);

const answerPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are Zalvro's friendly assistant for web development and AI automation.
Answer in 1-3 short sentences unless asked for more detail; do not add headings or bullet lists by default. Reply in the language the visitor uses (English or Roman Urdu). Respond naturally to greetings and small talk.

For Zalvro-specific facts, use the supplied context and do not invent services, prices, portfolio claims, timelines, or technical capabilities. If the context is incomplete, give any supported partial answer and offer the contact page instead of saying only that you do not know. For unrelated requests, politely explain that you can help with Zalvro-related questions.

Technology and stack rules: Never describe MERN as Zalvro's only stack. MERN is the primary/default web stack. The only other confirmed technologies in this area are Next.js, TypeScript, Node.js, MongoDB, Qdrant (vector database), LangChain, WhatsApp bot integrations, and Python specifically for ML/AI and automation. Confirm a technology only within its documented scope; Python support does not imply Django or other Python web frameworks. For website/backend framework alternatives, suggest MERN or Next.js; do not suggest Python for website backends. Say Zalvro can work with a visitor's preferred/required stack only if that stack is explicitly in this confirmed list. Never say or imply "any stack", "whatever stack you prefer", "related technologies", or "and similar". If a visitor asks for an unlisted stack, say it is outside Zalvro's documented expertise, suggest the closest suitable listed alternative for their stated goal, and link ${CONTACT_PAGE_URL}. Never invent technologies or experience. If asked to recommend a stack without the visitor specifying their current stack or requirements, briefly ask what stack or requirements they have in mind rather than assuming. Do not infer that Gemini, LangChain, or Groq/Llama are Python-based from their mention in the context.

Pricing policy: Never state or imply a fixed price or amount. Explain that pricing depends on project scope and requirements; briefly mention relevant factors such as pages/features, custom functionality/integrations, and AI or workflow automation. Then direct the visitor to the contact page.

When someone wants a real person or asks how to start, give these contacts in this order: contact page ${CONTACT_PAGE_URL}, email ${CONTACT_EMAIL}, WhatsApp ${WHATSAPP_URL}.

Context:
{context}`,
  ],
  ["human", "{question}"],
]);

const outputParser = new StringOutputParser();

function isPricingQuestion(question) {
  return /\b(price|pricing|cost|costs|how much|budget|rate|rates|charges?|fee|fees|kitna|qeemat|lagat|kharcha)\b/i.test(
    question,
  );
}

function isContactQuestion(question) {
  return /\b(contact|reach (?:out|someone|a person|a human)|real person|human (?:being|agent)|speak (?:to|with)|talk (?:to|with)|get started|start (?:a|my) project|email address|phone number|rabta|insan se baat)\b/i.test(
    question,
  );
}

function isRomanUrdu(question) {
  return /\b(aap|kya|kaise|kaisay|kitna|kitni|chahiye|karna|hai|hain|ke liye|batao|batayein|mera|meri)\b/i.test(
    question,
  );
}

function pricingAnswer(question) {
  if (isRomanUrdu(question)) {
    return `Pricing aap ke project ke scope aur requirements par depend karti hai. Pages/features ki tadaad, custom functionality ya integrations, aur AI/workflow automation cost ko affect karte hain. Tailored estimate ke liye contact karein: ${CONTACT_PAGE_URL}`;
  }

  return `Pricing depends on your project's scope and requirements. The number of pages and features, custom functionality or integrations, and any AI or workflow automation all affect the work involved. For a tailored estimate, please visit ${CONTACT_PAGE_URL}.`;
}

function contactAnswer(question) {
  if (isRomanUrdu(question)) {
    return `Zalvro ki team se rabta karne ke liye pehle contact page dekhein: ${CONTACT_PAGE_URL}. Aap ${CONTACT_EMAIL} par email bhi kar sakte hain, ya WhatsApp par ${WHATSAPP_URL} se message karein.`;
  }

  return `To speak with the Zalvro team, start at the contact page: ${CONTACT_PAGE_URL}. You can also email ${CONTACT_EMAIL} or message us on WhatsApp at ${WHATSAPP_URL}.`;
}

async function rewriteQuestion(question, history) {
  if (history.length === 0) {
    return question;
  }

  const historyMessages = history.map(({ role, content }) =>
    role === "assistant" ? new AIMessage(content) : new HumanMessage(content),
  );
  const promptValue = await rewritePrompt.invoke({
    history: historyMessages,
    question,
  });
  const standaloneQuestion = (await llm.pipe(outputParser).invoke(promptValue)).trim();

  if (!standaloneQuestion) {
    throw new Error("The history-aware question rewrite returned an empty question.");
  }

  return standaloneQuestion;
}

async function answerQuestion(query, history = []) {
  const standaloneQuestion = await rewriteQuestion(query, history);

  if (isPricingQuestion(standaloneQuestion)) {
    return pricingAnswer(standaloneQuestion);
  }

  if (isContactQuestion(standaloneQuestion)) {
    return contactAnswer(standaloneQuestion);
  }

  const documents = await retrieveDocuments(standaloneQuestion);
  const context = documents
    .map((document) => document.pageContent.trim())
    .filter(Boolean)
    .join("\n\n");
  const promptValue = await answerPrompt.invoke({
    context: context || "(No relevant information was found in the knowledge base.)",
    question: standaloneQuestion,
  });

  return llm.pipe(outputParser).invoke(promptValue);
}

export { answerQuestion, llm };