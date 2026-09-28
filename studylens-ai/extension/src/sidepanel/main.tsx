import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Result = {
  answer: string;
  explanation: string;
  steps: string[];
  topic: string;
};

const API_URL = "https://studylens-ai-9fia.onrender.com/api/solve";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.session.get("pendingSelection").then((data) => {
      if (data.pendingSelection) {
        setQuestion(String(data.pendingSelection));
        chrome.storage.session.remove("pendingSelection");
      }
    });
  }, []);

  async function solve() {
    if (!question.trim()) {
      setError("Enter or highlight a question first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header>
        <div>
          <div className="brand">StudyLens AI</div>
          <div className="subtitle">Question Solver & Explanation</div>
        </div>
        <div className="status-dot" title="StudyLens"></div>
      </header>

      <section className="hero">
        <h1>Ask. Solve. Understand.</h1>
        <p>Paste a question or highlight text on a webpage.</p>
      </section>

      <section className="input-card">
        <label>Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: What is the time complexity of binary search?"
        />
        <button onClick={solve} disabled={loading}>
          {loading ? "Solving..." : "✨ Solve & Explain"}
        </button>
      </section>

      {error && <div className="error">{error}</div>}

      {result && (
        <section className="result">
          <div className="topic">{result.topic}</div>

          <div className="answer-box">
            <h2>Answer</h2>
            <p>{result.answer}</p>
          </div>

          <div className="explanation-box">
            <h2>Explanation</h2>
            <p>{result.explanation}</p>
          </div>

          {result.steps.length > 0 && (
            <div className="steps-box">
              <h2>Step-by-step</h2>
              <ol>
                {result.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      <footer>
        StudyLens AI • College Project Prototype
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
