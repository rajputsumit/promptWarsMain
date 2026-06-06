"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { clsx } from "@/lib/clsx";
import type { ChatMessage } from "@/lib/types";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I'm Serene — your companion here. This is a private, judgment-free space. However your day is going, you can tell me about it. What's on your mind?",
};

const STARTERS = [
  "I'm anxious about an upcoming test",
  "I can't sleep, my mind won't stop",
  "I feel like I'm falling behind everyone",
  "I just need to vent",
];

export default function CompanionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ??
            "I'm here with you. Take a slow breath — I'll be right here when you're ready.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now, but you're not alone. Try a slow breath in for 4 and out for 6. I'll be here.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-3xl flex-col px-container-padding py-6">
      <header className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container">
          <Icon name="spa" filled className="text-on-secondary-container" />
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Serene</h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            Your private wellness companion
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg py-4 hide-scrollbar">
        {messages.map((m, i) => (
          <div
            key={i}
            className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={clsx(
                "max-w-[85%] animate-fade-up whitespace-pre-wrap rounded-[1.5rem] px-5 py-3 font-body-md text-body-md",
                m.role === "user"
                  ? "rounded-br-md bg-primary-container text-on-primary-container"
                  : "glass-card rounded-bl-md text-on-surface"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="glass-card flex gap-1 rounded-[1.5rem] rounded-bl-md px-5 py-4">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-2 w-2 animate-pulse rounded-full bg-on-surface-variant"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Starters */}
      {messages.length === 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-outline-variant/30 bg-surface-container px-4 py-2 font-label-md text-sm text-on-surface-variant transition-colors hover:bg-surface-variant"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Share what you're feeling…"
          aria-label="Message your companion"
          className="input-soft max-h-32 flex-1 resize-none rounded-[1.5rem] px-5 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="Send"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md transition-transform hover:scale-105 disabled:opacity-50"
        >
          <Icon name="send" filled />
        </button>
      </form>
      <p className="mt-2 text-center font-body-md text-xs text-on-surface-variant/60">
        Serene is a supportive companion, not a medical professional. In crisis, call Tele-MANAS 14416.
      </p>
    </div>
  );
}
