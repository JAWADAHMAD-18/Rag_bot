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

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export { generateAnswer };