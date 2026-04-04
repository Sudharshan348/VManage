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
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-3 max-h-96 overflow-y-auto px-2 border border-border rounded p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Start a conversation to see AI replies here.
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto max-w-xs rounded bg-primary text-primary-foreground px-3 py-2 text-sm"
                  : "mr-auto max-w-xs rounded bg-white border border-border px-3 py-2 text-sm"
              }
            >
              <p className="mb-1 text-xs font-semibold opacity-75">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
