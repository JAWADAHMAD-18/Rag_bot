import { retrieveChunks } from "../services/retrieval.service.js";
import { generateAnswer } from "../services/groq.service.js";
import { getVisitorShortcutAnswer } from "../services/visitor-shortcuts.js";

async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message must be a non-empty string." });
    }

    const shortcutAnswer = getVisitorShortcutAnswer(message);
    if (shortcutAnswer) {
      return res.json({ answer: shortcutAnswer });
    }

    const chunks = await retrieveChunks(message);
    if (chunks.length === 0) {
      return res.status(503).json({
        error: "No knowledge context was found for this question. Please try rephrasing or contact us.",
      });
    }

    const answer = await generateAnswer(message, chunks);

    return res.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Chat request failed:", message);
    return res.status(err?.statusCode || 500).json({
      error: err?.statusCode ? message : "The chat service is temporarily unavailable. Please try again shortly.",
    });
  }
}

export { handleChat };