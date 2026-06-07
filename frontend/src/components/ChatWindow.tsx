"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: Message[];
  onSuggest?: (q: string) => void;
}

const SUGGESTIONS = [
  { icon: "📋", text: "Give me a summary of the documents" },
  { icon: "👥", text: "List the authors and affiliations" },
  { icon: "🔬", text: "What are the key findings?" },
  { icon: "⚙️", text: "What methods were used?" },
];

export default function ChatWindow({ messages, onSuggest }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 shadow-xl shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-indigo-500" />
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">How can I help you today?</h2>
            <p className="mt-1.5 text-sm text-gray-400">Ask anything about your ingested documents</p>
          </div>
        </div>

        {onSuggest && (
          <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => onSuggest(s.text)}
                className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md"
              >
                <span className="text-base">{s.icon}</span>
                <span className="leading-snug">{s.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
