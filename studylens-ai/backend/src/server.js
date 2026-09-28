import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  })
);

app.use(express.json({ limit: "1mb" }));

function cleanAnswer(text) {
  return String(text || "").trim();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(errorText, attempt) {
  const match = errorText.match(/"retryDelay"\s*:\s*"(\d+)s"/);

  if (match) {
    return Number(match[1]) * 1000;
  }

  const fallbackDelays = [5000, 10000];
  return fallbackDelays[Math.min(attempt, fallbackDelays.length - 1)];
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "StudyLens AI backend"
  });
});

app.post("/api/solve", async (req, res) => {
  try {
    const { question, context = "" } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({
        error: "AI_API_KEY is not configured."
      });
    }

    const systemPrompt = `
You are StudyLens AI, an educational question-solving assistant.

Solve the user's question accurately and explain the answer so a student can understand it.
Do not merely give the final answer. Show concise reasoning or steps where appropriate.

Return ONLY valid JSON with this shape:
{
  "answer": "final answer",
  "explanation": "clear explanation",
  "steps": ["step 1", "step 2"],
  "topic": "short topic name"
}

For multiple-choice questions, identify the correct option and explain why.
For mathematical questions, show the important calculation steps.
For programming questions, explain the output/logic and mention complexity when useful.
If the question is ambiguous, state the assumption in the explanation.
`;

    const userPrompt = `
Question:
${question}

Optional webpage context:
${context}
`;

    const baseUrl = (
      process.env.AI_BASE_URL ||
      "https://api.openai.com/v1"
    ).replace(/\/$/, "");

    const requestBody = {
      model: process.env.AI_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    };

    let response;
    let errorText = "";

    // Retry temporary AI provider errors up to 3 times.
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.AI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        break;
      }

      errorText = await response.text();

      const temporaryError =
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504;

      if (!temporaryError || attempt === 2) {
        console.error("AI provider error:", errorText);

        return res.status(502).json({
          error: "AI provider request failed.",
          details: errorText.slice(0, 1000)
        });
      }

      const delay = getRetryDelay(errorText, attempt);

      console.log(
        `AI provider temporarily unavailable. Retry ${
          attempt + 1
        }/2 after ${Math.round(delay / 1000)} seconds.`
      );

      await wait(delay);
    }

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        error: "AI provider returned no answer."
      });
    }

    let result;

    try {
      result = JSON.parse(content);
    } catch {
      result = {
        answer: content,
        explanation: "The AI returned a non-structured response.",
        steps: [],
        topic: "General"
      };
    }

    res.json({
      answer: cleanAnswer(result.answer),
      explanation: cleanAnswer(result.explanation),
      steps: Array.isArray(result.steps) ? result.steps : [],
      topic: cleanAnswer(result.topic) || "General"
    });
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Unexpected server error."
    });
  }
});

app.listen(PORT, () => {
  console.log(`StudyLens AI backend running at http://localhost:${PORT}`);
});
