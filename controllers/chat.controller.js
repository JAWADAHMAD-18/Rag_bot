import { retrieveChunks } from "../services/retrieval.service.js";
import { generateAnswer } from "../services/groq.service.js";

async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const chunks = await retrieveChunks(message);
    const answer = await generateAnswer(message, chunks);

    res.json({ answer });
  } catch (err) {
    console.error("Error in chat controller:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export { handleChat };