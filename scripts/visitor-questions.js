import { getVisitorShortcutAnswer } from "../services/visitor-shortcuts.js";

const originalQuestions = [
  {
    question: "how can I contact you",
    expected: "https://zalvrohq.com/contact",
  },
  {
    question: "what services do you provide",
    expected: "AI voice receptionists",
  },
  {
    question: "how much does a website cost?",
    expected: "starts from $299",
  },
];

const newQuestions = [
  { question: "do you work with Python?", expected: "Yes." },
  { question: "can you build in Django?", expected: "Django" },
  { question: "I need a Laravel site", expected: "outside our confirmed expertise" },
  { question: "do you use Java Spring?", expected: "outside our confirmed expertise" },
  { question: "which stack for an AI chatbot?", expected: "Google Gemini" },
  { question: "only MERN?", expected: "No." },
  { question: "which LLM do you use?", expected: "OpenAI" },
  { question: "do you only use Gemini?", expected: "Google Gemini" },
];

const phraseVariations = [
  "cost of 2 pages website",
  "coast of 2 pages website",
  "price",
  "rates",
  "quote",
  "contact admin",
  "talk to a human",
  "kisi se baat karni hai",
  "rabta kaise karoon",
];

let failures = 0;
let totalChecks = 0;
let passedChecks = 0;

function runQuestion({ question, expected }, label) {
  const answer = getVisitorShortcutAnswer(question);
  const passed = typeof answer === "string" && answer.includes(expected);
  totalChecks += 1;
  console.log(`${passed ? "PASS" : "FAIL"} ${label}: ${question}`);
  console.log(`  Answer: ${answer || "(no shortcut answer)"}`);
  if (passed) {
    passedChecks += 1;
  } else {
    failures += 1;
  }
}

console.log("Original 3 visitor questions:");
originalQuestions.forEach((test, index) => runQuestion(test, `original ${index + 1}`));

console.log("\nNew 8 visitor questions:");
newQuestions.forEach((test, index) => runQuestion(test, `new ${index + 1}`));

console.log("\nPricing/contact phrase variations:");
for (const question of phraseVariations) {
  const answer = getVisitorShortcutAnswer(question);
  const isContact = /contact|talk|human|kisi|rabta/.test(question);
  const passed = answer && (isContact
    ? answer.includes("https://zalvrohq.com/contact")
    : answer.includes("$299"));
  totalChecks += 1;
  console.log(`${passed ? "PASS" : "FAIL"} phrase: ${question}`);
  console.log(`  Answer: ${answer || "(no shortcut answer)"}`);
  if (passed) {
    passedChecks += 1;
  } else {
    failures += 1;
  }
}

console.log(`\nVisitor checks: ${passedChecks}/${totalChecks} passed, ${failures} failed.`);
if (failures > 0) {
  process.exitCode = 1;
}
