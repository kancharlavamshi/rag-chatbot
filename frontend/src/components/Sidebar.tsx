"use client";

import { useState } from "react";
import { HistoryItem } from "@/types";

interface Props {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  onLogout: () => void;
  deletingIds: Set<number>;
  userEmail?: string;
}

export default function Sidebar({ history, onSelect, onDelete, onClearAll, onLogout, deletingIds, userEmail }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  function handleClearAll() {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-gray-950 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg shadow-indigo-900/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="font-bold tracking-tight text-white">DocChat</p>
          <p className="text-[10px] text-gray-500">RAG · GPT-4o</p>
        </div>
      </div>

      <div className="mx-3 h-px bg-gray-800" />

      {/* History */}
      <div className="scrollbar-dark flex-1 overflow-y-auto px-2 py-3">
        {history.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 px-4 text-center">
            <div className="rounded-full bg-gray-800 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">No conversations yet.<br />Ask your first question!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Recent</p>
              <button
                onClick={handleClearAll}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${
                  confirmClear ? "bg-red-900/50 text-red-400" : "text-gray-600 hover:text-red-400"
                }`}
              >
                {confirmClear ? "Confirm?" : "Clear all"}
              </button>
            </div>

            {history.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center rounded-lg transition-colors hover:bg-gray-800/80"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button onClick={() => onSelect(item)} className="min-w-0 flex-1 px-3 py-2.5 text-left">
                  <p className="truncate text-sm text-gray-400 group-hover:text-gray-100">{item.question}</p>
                  <p className="mt-0.5 text-[10px] text-gray-600">
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </button>
                {hoveredId === item.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    disabled={deletingIds.has(item.id)}
                    className="mr-2 shrink-0 rounded-md p-1.5 text-gray-600 transition hover:bg-gray-700 hover:text-red-400 disabled:opacity-40"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mx-3 h-px bg-gray-800" />

      {/* Footer */}
      <div className="p-3 space-y-1">
        {userEmail && (
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
              {userEmail[0].toUpperCase()}
            </div>
            <p className="truncate text-xs text-gray-400">{userEmail}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-800 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
