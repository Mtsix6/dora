"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Send, Sparkles, StopCircle, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiSettingsSummary {
  provider?: string;
  providerLabel?: string;
  usage?: {
    remaining: string | number;
  };
}

function extractTextDeltasFromSseChunk(chunk: string) {
  const deltas: string[] = [];
  const events = chunk.split("\n\n");

  for (const event of events) {
    const dataLines = event
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter(Boolean);

    for (const line of dataLines) {
      if (line === "[DONE]") {
        continue;
      }

      try {
        const parsed = JSON.parse(line) as { type?: string; delta?: string };
        if (parsed.type === "text-delta" && typeof parsed.delta === "string") {
          deltas.push(parsed.delta);
        }
      } catch {
        deltas.push(line);
      }
    }
  }

  return deltas;
}

function consumeSseBuffer(buffer: string) {
  const lastBoundary = buffer.lastIndexOf("\n\n");
  if (lastBoundary === -1) {
    return { deltas: [] as string[], rest: buffer };
  }

  const complete = buffer.slice(0, lastBoundary);
  const rest = buffer.slice(lastBoundary + 2);
  return {
    deltas: extractTextDeltasFromSseChunk(complete),
    rest,
  };
}

export function DoraAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState("DORA AI");
  const pathname = usePathname();
  const chatRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I am DORA Copilot. I can help you map controls to regulations, draft incident reports, or analyze third-party risk. How can I assist you today?",
    },
  ]);

  const getContextHint = () => {
    if (pathname.includes("incidents")) return "Ask me to analyze the latest incident...";
    if (pathname.includes("ict-risk")) return "Ask me to cross-reference ICT assets with Art. 9...";
    if (pathname.includes("library")) return "Ask me to summarize a policy...";
    if (pathname.includes("third-party")) return "Ask me about vendor compliance gaps...";
    if (pathname.includes("compliance")) return "Ask me about DORA article requirements...";
    if (pathname.includes("extraction")) return "Ask me about this contract's DORA clauses...";
    return "Ask me anything about DORA compliance...";
  };

  const getPageContext = () => {
    if (pathname.includes("incidents")) {
      return "User is on the Incident Reporting page (DORA Art. 17-23).";
    }
    if (pathname.includes("ict-risk")) {
      return "User is on the ICT Risk Management page (DORA Art. 5-16).";
    }
    if (pathname.includes("third-party")) {
      return "User is on the Third-Party Risk Management page (DORA Art. 28-44).";
    }
    if (pathname.includes("resilience")) {
      return "User is on the Resilience Testing page (DORA Art. 24-27).";
    }
    if (pathname.includes("compliance")) {
      return "User is on the Compliance & Governance overview page.";
    }
    if (pathname.includes("extraction")) {
      return "User is on the Contract Extraction page, reviewing an AI-extracted document.";
    }
    if (pathname.includes("dashboard")) {
      return "User is on the main Dashboard viewing compliance overview.";
    }
    return "User is navigating the DORA RoI Automator SaaS platform.";
  };
  const contextHint = getContextHint();
  const pageContext = getPageContext();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    fetch("/api/ai/settings")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Unable to load AI settings");
        }

        return (await res.json()) as AiSettingsSummary;
      })
      .then((data) => {
        const label = data.providerLabel || data.provider || "DORA AI";
        const remaining = data.usage?.remaining;
        setProviderInfo(remaining !== undefined ? `${label} | ${remaining} remaining` : label);
      })
      .catch(() => {
        setProviderInfo("DORA AI");
      });
  }, [isOpen]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTyping(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) {
      return;
    }

    const assistantId = crypto.randomUUID();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const outgoingMessages = [...messages, userMessage];
    setMessages([...outgoingMessages, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsTyping(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoingMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          context: pageContext,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "AI service error" }));
        throw new Error(err.message || err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      const isSse = res.headers.get("content-type")?.includes("text/event-stream");
      let pendingSse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const deltas = isSse
          ? (() => {
              const consumed = consumeSseBuffer(pendingSse + chunk);
              pendingSse = consumed.rest;
              return consumed.deltas;
            })()
          : [chunk];

        if (deltas.length === 0) {
          continue;
        }

        const textDelta = deltas.join("");
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: message.content + textDelta }
              : message,
          ),
        );
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        const message = err instanceof Error ? err.message : "AI service error";
        setError(message);
        setMessages((current) => current.filter((item) => item.id !== assistantId));
      }
    } finally {
      abortRef.current = null;
      setIsTyping(false);
    }
  }, [input, isTyping, messages, pageContext]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 flex h-[550px] max-h-[calc(100vh-120px)] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),0_0_0_1px_rgba(99,91,255,0.15)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0A2540] to-[#1E3A5F] px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-sm bg-white/10 p-1">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold tracking-wide">DORA AI Copilot</h3>
                  <p className="text-[10px] text-white/70">{providerInfo}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 transition-colors hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              ref={chatRef}
              className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto bg-[#F6F9FC]/30 p-4"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex max-w-[90%] gap-3",
                    message.role === "user" ? "ml-auto flex-row-reverse" : "",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-7 flex-shrink-0 items-center justify-center rounded-full border",
                      message.role === "user"
                        ? "border-[#E3E8EF] bg-white shadow-sm"
                        : "border-transparent bg-gradient-to-br from-[#635BFF] to-[#0A2540] shadow-md",
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="size-3.5 text-muted-foreground" />
                    ) : (
                      <Sparkles className="size-3.5 text-white" />
                    )}
                  </div>

                  <div
                    className={cn(
                      "whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-[1.5]",
                      message.role === "user"
                        ? "rounded-tr-sm bg-[#635BFF] text-white shadow-sm"
                        : "rounded-tl-sm border border-[#E3E8EF] bg-white text-[#0A2540] shadow-sm",
                    )}
                  >
                    {message.content || (
                      <span className="text-[12px] italic text-muted-foreground">Thinking...</span>
                    )}
                  </div>
                </motion.div>
              ))}

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                  <AlertCircle className="size-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="border-t border-[#E3E8EF] bg-white p-3">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSend();
                    }
                  }}
                  placeholder={contextHint}
                  className="w-full rounded-full border border-[#E3E8EF] bg-[#F6F9FC] py-2.5 pl-4 pr-12 text-[13px] transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30"
                />
                <button
                  onClick={isTyping ? handleStop : handleSend}
                  disabled={!isTyping && !input.trim()}
                  className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#635BFF] text-white transition-colors hover:bg-[#4F46E5] disabled:opacity-50"
                >
                  {isTyping ? <StopCircle className="size-3.5" /> : <Send className="ml-0.5 size-3.5" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-2">
                <p className="text-[9px] text-muted-foreground">
                  Responses are generated from your configured AI provider and DORA prompt set.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "group flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          isOpen
            ? "scale-90 rotate-90 bg-[#0A2540]"
            : "bg-gradient-to-tr from-[#635BFF] to-[#4F46E5] hover:shadow-2xl hover:shadow-[#635BFF]/30",
        )}
      >
        {isOpen ? <X className="size-6 text-white" /> : <Sparkles className="size-6 text-white" />}
      </motion.button>
    </div>
  );
}
