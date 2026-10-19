import "dotenv/config";
import assert from "node:assert/strict";
import { answerQuestion } from "../services/groq.service.js";

const questions = [
  { question: "what type of services you provide" },
  { question: "pricing details for web services" },
  { question: "how do I contact a real person" },
  { question: "What does Zalvro do?" },
  { question: "Do you build React websites?" },
  { question: "Can you build a real estate listing website?" },
  { question: "Do you make AI voice receptionists?" },
  { question: "Can your voice agent book appointments?" },
  { question: "Do you build chatbots for websites?" },
  { question: "What is PropBot?" },
  { question: "Can you automate lead follow-up?" },
  { question: "Do you build WhatsApp bots for businesses?" },
  { question: "Can you maintain or redesign my current website?" },
  { question: "Which technologies do you use for web development?" },
  { question: "Can you work with a medical or dental clinic?" },
  { question: "Do you take projects outside real estate?" },
  { question: "How long does a small project usually take?" },
  { question: "How do I start a project?" },
  { question: "Who can I talk to about my project?" },
  { question: "What examples are in your portfolio?" },
  { question: "Do you provide support after a website launches?" },
  { question: "Hi, how are you?" },
  { question: "do you work with Python?" },
  { question: "can you build in Django?" },
  { question: "I need a Laravel site" },
  { question: "do you use Java Spring?" },
  { question: "which stack do you recommend for an AI chatbot?" },
  { question: "only MERN?" },
  {
    question: "What is the pricing for it?",
    history: [
      { role: "user", content: "I need a website for my business." },
      { role: "assistant", content: "Zalvro builds business websites." },
    ],
  },
  {
    question: "Can you add a chatbot to that?",
    history: [
      { role: "user", content: "I already have a real estate website." },
      {
        role: "assistant",
        content: "Zalvro can improve existing websites and add chatbots.",
      },
    ],
  },
];

const delayMs = Number(process.env.VISITOR_TEST_DELAY_MS ?? 12000);

for (const [index, { question, history = [] }] of questions.entries()) {
  const answer = await answerQuestion(question, history);
  console.log(`\nQ: ${question}\nA: ${answer}`);

  if (/\b(pric(?:e|ing)|cost|how much)\b/i.test(question)) {
    assert.match(answer, /zalvrohq\.com\/contact/i);
    assert.doesNotMatch(answer, /(?:\$|USD\s*)\d/i);
  }

  if (/contact a real person/i.test(question)) {
    assert.ok(answer.indexOf("zalvrohq.com/contact") < answer.indexOf("contact@zalvrohq.com"));
    assert.ok(answer.indexOf("contact@zalvrohq.com") < answer.indexOf("wa.me/923039245454"));
  }

  if (/do you work with python/i.test(question)) {
    assert.match(answer, /python/i);
    assert.match(answer, /AI|ML|machine.learning|automation/i);
  }

  if (/can you build in django|laravel site|java spring/i.test(question)) {
    assert.match(answer, /MERN|Next\.js/i);
    assert.match(answer, /zalvrohq\.com\/contact/i);
    assert.doesNotMatch(answer, /any stack|whatever stack|related technologies|and similar/i);
    assert.doesNotMatch(
      answer,
      /(?:we|zalvro).{0,40}(?:can |do |will )?(?:build|work with|develop|support).{0,30}(?:django|laravel|java spring)/i,
    );
  }

  if (/which stack do you recommend/i.test(question)) {
    assert.match(answer, /what|which|requirements|preferred stack/i);
    assert.doesNotMatch(answer, /Python-based tools like Gemini|Gemini,? LangChain,? or Groq.{0,30}Python/i);
  }

  if (/only MERN/i.test(question)) {
    assert.match(answer, /primary/i);
    assert.doesNotMatch(answer, /any stack|whatever stack/i);
  }

  if (index < questions.length - 1 && delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

console.log(`\nPrinted answers for ${questions.length} visitor questions.`);
