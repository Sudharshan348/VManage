"use client";

import { useState } from "react";

import { AccentButton, Field, Textarea } from "@/components/v1-portal";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  data?: {
    answer?: string;
    response?: string;
    message?: string;
    [key: string]: unknown;
  };
  message?: string;
};

function extractAssistantText(data: ChatResponse["data"]) {
  if (!data) return "";
  if (typeof data.answer === "string") return data.answer;
  if (typeof data.response === "string") return data.response;
  if (typeof data.message === "string") return data.message;
  return JSON.stringify(data, null, 2);
}

export function ChatClient() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    const prompt = question.trim();
    setLoading(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: prompt }]);
    setQuestion("");

    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: prompt }),
      });

      const result = (await response.json()) as ChatResponse;

      if (!response.ok) {
        setError(result.message || "Unable to get chat response");
        return;
      }

      const assistantText = extractAssistantText(result.data) || "No response received";
      setMessages((current) => [...current, { role: "assistant", content: assistantText }]);
    } catch {
      setError("Unable to get chat response");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Ask something">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask the hostel assistant anything"
            required
          />
        </Field>
        <div className="flex justify-end">
          <AccentButton accent="green" disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </AccentButton>
        </div>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Start a conversation to see AI replies here.
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto max-w-3xl rounded-[24px] bg-emerald-600 px-5 py-4 text-sm text-white"
                  : "max-w-3xl rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-800"
              }
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
