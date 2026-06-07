"use client";

import { useState } from "react";
import { Source } from "@/types";

interface Props {
  sources: Source[];
}

export default function SourceCard({ sources }: Props) {
  const [open, setOpen] = useState(false);

  if (!sources.length) return null;

  const unique = sources.length;

  return (
    <div className="mt-2.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {unique} source{unique !== 1 ? "s" : ""}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-1.5 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
          {sources.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-600">
                {i + 1}
              </span>
              <span className="flex-1 truncate font-medium text-gray-700">{s.filename}</span>
              <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-500">p.{s.page}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
