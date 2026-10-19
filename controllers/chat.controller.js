import { answerQuestion } from "../services/groq.service.js";

async function handleChat(req, res) {
  try {
    const body = req.body ?? {};
    const { message, history = [] } = body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message must be a non-empty string" });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({ error: "History must be an array of messages" });
    }

    const recentHistory = history.slice(-6);
    const validHistory = recentHistory.every(
      (entry) =>
        entry &&
        ["user", "assistant"].includes(entry.role) &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0,
    );

    if (!validHistory) {
      return res.status(400).json({
        error: "Each history message must have a user/assistant role and non-empty content",
      });
    }

    const answer = await answerQuestion(message.trim(), recentHistory);

    res.json({ answer });
  } catch (err) {
    console.error("Error in chat controller:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export { handleChat };