"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { api } from "@/lib/api";
import { Message, HistoryItem } from "@/types";
import ChatWindow from "@/components/ChatWindow";
import InputBar from "@/components/InputBar";
import Sidebar from "@/components/Sidebar";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [userEmail, setUserEmail] = useState<string>("");

  const loadHistory = useCallback(async () => {
    try {
      const items = await api.history();
      setHistory(items);
    } catch {
      // token may be expired
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.sub || "");
    } catch { /* ignore */ }
    loadHistory();
  }, [router, loadHistory]);

  async function handleSend(question: string) {
    const id = uuid();
    const placeholder: Message = { id, question, answer: "", sources: [], isLoading: true };
    setMessages((prev) => [...prev, placeholder]);
    setLoading(true);

    try {
      await api.chatStream(
        question,
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id ? { ...m, answer: m.answer + token, isLoading: false } : m,
            ),
          );
        },
        (sources) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, sources } : m)),
          );
          loadHistory();
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, answer: `Error: ${msg}`, sources: [], isLoading: false } : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHistorySelect(item: HistoryItem) {
    setMessages([{
      id: uuid(),
      question: item.question,
      answer: item.answer,
      sources: item.sources,
    }]);
  }

  async function handleDeleteMessage(id: number) {
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await api.deleteMessage(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }

  async function handleClearHistory() {
    await api.clearHistory();
    setHistory([]);
    setMessages([]);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        history={history}
        onSelect={handleHistorySelect}
        onDelete={handleDeleteMessage}
        onClearAll={handleClearHistory}
        onLogout={handleLogout}
        deletingIds={deletingIds}
        userEmail={userEmail}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300" />
            <p className="text-sm font-medium text-gray-700">Answers sourced exclusively from your documents</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-indigo-100">
            GPT-4o
          </span>
        </header>

        <ChatWindow messages={messages} onSuggest={handleSend} />
        <InputBar onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
