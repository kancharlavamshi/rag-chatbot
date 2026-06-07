import { Message } from "@/types";
import SourceCard from "./SourceCard";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isStreaming = !message.isLoading && message.answer !== "" && message.sources.length === 0;

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      {/* Question */}
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-indigo-200">
          {message.question}
        </div>
      </div>

      {/* Answer */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div className="min-w-0 max-w-[80%]">
          <div className="rounded-2xl rounded-tl-sm bg-white px-5 py-4 text-sm leading-7 text-gray-800 shadow-sm ring-1 ring-gray-100">
            {message.isLoading ? (
              <span className="flex items-center gap-2 text-gray-400">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-300 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-300 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
                </span>
                <span className="text-gray-400">Searching documents…</span>
              </span>
            ) : (
              <p className={`whitespace-pre-wrap ${isStreaming ? "cursor-blink" : ""}`}>
                {message.answer}
              </p>
            )}
          </div>
          {!message.isLoading && message.sources.length > 0 && (
            <SourceCard sources={message.sources} />
          )}
        </div>
      </div>
    </div>
  );
}
