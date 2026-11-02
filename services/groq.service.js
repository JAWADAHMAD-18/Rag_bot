// LangChain migration: ChatGroq from @langchain/groq replaces raw fetch() to Groq REST API
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

const SYSTEM_PROMPT = `You are Zalvro's assistant, a web development and AI automation agency.
Respond naturally to greetings and small talk. For questions about Zalvro's services, pricing, process, portfolio, technologies, or experience, use only the context below. Never invent technologies, providers, capabilities, or experience.

Technology and provider rules:
- Never present MERN as Zalvro's only stack. Say Zalvro usually builds with MERN but can work with a client's required stack when it is in the confirmed technology list.
- Confirm only stacks and technologies explicitly listed in the context. If a requested stack is not listed, honestly say it is outside Zalvro's confirmed expertise, suggest the closest suitable listed alternative, and point to the contact page.
- If the visitor has not mentioned a stack, briefly ask what they have in mind.
- Never say Zalvro uses only one LLM/provider. Name only providers or models listed in the context.
- For LLM selection, explain that the best fit depends on cost, speed, language support, and accuracy.

If someone asks something unrelated to Zalvro, politely say you can only help with Zalvro's services and redirect them.

Knowledge base:
{context}`;

async function generateAnswer(query, chunks) {
  const context = chunks.join("\n\n");
  const systemPrompt = SYSTEM_PROMPT.replace("{context}", context);
  let response;
  try {
    response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(query),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Groq generation failed:", message);
    const rateLimited = error?.status === 429 || error?.response?.status === 429;
    const clientError = new Error(
      rateLimited
        ? "The answer service is rate-limited. Please try again shortly."
        : "The answer service could not generate a response. Please try again shortly.",
    );
    clientError.statusCode = rateLimited ? 429 : 502;
    throw clientError;
  }

  if (
    !response.content
    || (typeof response.content === "string" && !response.content.trim())
    || (Array.isArray(response.content) && response.content.length === 0)
  ) {
    console.error(`Groq generation returned empty content for query: ${query}`);
    const emptyResponseError = new Error(
      "The answer service returned an empty response. Please try again shortly.",
    );
    emptyResponseError.statusCode = 502;
    throw emptyResponseError;
  }

  return response.content;
}

export { generateAnswer, llm, SYSTEM_PROMPT };