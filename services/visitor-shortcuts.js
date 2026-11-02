const CONTACT_PAGE = "https://zalvrohq.com/contact";
const CONTACT_EMAIL = "contact@zalvrohq.com";

function normalize(query) {
  return query
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isContactRequest(query) {
  return /\b(contact|reach|email|whatsapp|admin|human|person|rabta)\b|talk to (a )?human|speak to (a )?human|kisi se baat|baat karni|kaise karoon/.test(query);
}

function isPricingRequest(query) {
  return /\b(price|prices|pricing|cost|coast|rate|rates|quote|quotation|budget|how much|starting from|starting price)\b/.test(query);
}

function contactAnswer() {
  return `Contact page: [${CONTACT_PAGE}](${CONTACT_PAGE}). Email: ${CONTACT_EMAIL}. For WhatsApp, use the WhatsApp option on that contact page.`;
}

function pricingAnswer(query) {
  if (/\b(calling|voice|receptionist)\b/.test(query)) {
    return `AI Calling Agent projects start from $289. Final pricing depends on the exact requirements and is confirmed after a discovery meeting. Request a quote through the [contact page](${CONTACT_PAGE}).`;
  }

  if (/\b(website|web site|site|page|pages)\b/.test(query)) {
    return `A single-page or double-page website starts from $299. More pages, integrations, and other requirements are priced according to scope after a discovery meeting. Request a project-specific quote through the [contact page](${CONTACT_PAGE}).`;
  }

  return `Pricing depends on the project and its scope. Websites start from $299 for a single-page or double-page site, and AI Calling Agents start from $289; extra pages, integrations, and other work are quoted after a discovery meeting. Request a project-specific quote through the [contact page](${CONTACT_PAGE}).`;
}

function stackAnswer(query) {
  if (/\b(laravel|java spring|spring boot)\b/.test(query)) {
    const requested = query.includes("laravel") ? "Laravel" : "Java Spring";
    return `${requested} is outside our confirmed expertise, so we can't claim to build with it. For a web project, our closest confirmed alternatives are usually MERN (MongoDB, Express, React, Node.js) or Python with Django/FastAPI. Please share your requirements on the [contact page](${CONTACT_PAGE}) so we can suggest the best fit.`;
  }

  if (/\b(python|django|fastapi|react native)\b/.test(query)) {
    return "Yes. Our confirmed technologies include Python, Django, FastAPI, and React Native, as well as our usual MERN stack (MongoDB, Express, React, Node.js). We adapt to a client's required stack only within this confirmed list.";
  }

  if (/\b(only|just)\s+mern\b|\bmern\s+(only|just)\b/.test(query)) {
    return "No. We usually build with MERN, but we can also work with confirmed technologies including Python, Django, FastAPI, and React Native, plus AI integration and AI application/product solutions.";
  }

  if (/\b(ai chatbot|chatbot|llm|language model|provider|gemini|groq|openai|hugging face)\b/.test(query)) {
    return "For an AI chatbot, we usually build the web application with MERN and can also use confirmed Python/Django/FastAPI technologies or React Native where suitable. We work with Google Gemini, Groq (including Llama models), OpenAI, and Hugging Face, selecting the fit based on cost, speed, language support, and accuracy.";
  }

  if (/\b(stack|technology|technologies|tech stack)\b/.test(query)) {
    return "We usually build with MERN (MongoDB, Express, React, Node.js), and can work with confirmed technologies including Python, Django, FastAPI, React Native, AI integration, and AI application/product solutions. What stack do you have in mind?";
  }

  return null;
}

function getVisitorShortcutAnswer(message) {
  const query = normalize(message);

  if (isContactRequest(query)) {
    return contactAnswer();
  }

  if (isPricingRequest(query)) {
    return pricingAnswer(query);
  }

  if (/\b(what services|services do you provide|your services)\b/.test(query)) {
    return "We build websites and web apps, AI voice receptionists, website and WhatsApp AI chatbots, AI integrations and workflow automations, and provide website maintenance. Share your requirements on our contact page to discuss the right scope.";
  }

  return stackAnswer(query);
}

export { getVisitorShortcutAnswer };
