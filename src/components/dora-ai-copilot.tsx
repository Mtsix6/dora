"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2, StopCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function DoraAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    if (pathname.includes("incidents"))
      return "Ask me to analyze the latest incident...";
    if (pathname.includes("ict-risk"))
      return "Ask me to cross-reference ICT assets with Art. 9...";
    if (pathname.includes("library"))
      return "Ask me to summarize a policy...";
    if (pathname.includes("third-party"))
      return "Ask me about vendor compliance gaps...";
    if (pathname.includes("compliance"))
      return "Ask me about DORA article requirements...";
    if (pathname.includes("extraction"))
      return "Ask me about this contract's DORA clauses...";
    return "Ask me anything about DORA compliance...";
  };

  const getPageContext = () => {
    if (pathname.includes("incidents"))
      return "User is on the Incident Reporting page (DORA Art. 17-23).";
    if (pathname.includes("ict-risk"))
      return "User is on the ICT Risk Management page (DORA Art. 5-16).";
    if (pathname.includes("third-party"))
      return "User is on the Third-Party Risk Management page (DORA Art. 28-44).";
    if (pathname.includes("resilience"))
      return "User is on the Resilience Testing page (DORA Art. 24-27).";
    if (pathname.includes("compliance"))
      return "User is on the Compliance & Governance overview page.";
    if (pathname.includes("extraction"))
      return "User is on the Contract Extraction page, reviewing an AI-extracted document.";
    if (pathname.includes("dashboard"))
      return "User is on the main Dashboard viewing compliance overview.";
    return "User is navigating the DORA RoI Automator SaaS platform.";
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTyping(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setError(null);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: getPageContext(),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "AI service error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.text }
                    : m,
                ),
              );
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User stopped
      } else {
        const msg = (err as Error).message;
        setError(msg);
        // Remove the empty assistant message on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return last?.id === assistantId && !last.content
            ? prev.slice(0, -1)
            : prev;
        });
      }
    } finally {
      abortRef.current = null;
      setIsTyping(false);
    }
  }, [input, isTyping, messages, pathname]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.95,
                transition: { duration: 0.2 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-4 w-[380px] h-[550px] max-h-[calc(100vh-120px)] rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),0_0_0_1px_rgba(99,91,255,0.15)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0A2540] to-[#1E3A5F] text-white">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-sm bg-white/10 flex items-center justify-center p-1">
                    <Sparkles className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold tracking-wide">
                      DORA AI Copilot
                    </h3>
                    <p className="text-[10px] text-white/70">
                      Powered by Claude — DORA RTS trained
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Chat Area */}
              <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-[#F6F9FC]/30"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3 max-w-[90%]",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "size-7 rounded-full flex-shrink-0 flex items-center justify-center border",
                        msg.role === "user"
                          ? "bg-white border-[#E3E8EF] shadow-sm"
                          : "bg-gradient-to-br from-[#635BFF] to-[#0A2540] border-transparent shadow-md",
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Sparkles className="size-3.5 text-white" />
                      )}
                    </div>

                    <div
                      className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-[13px] leading-[1.5] whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-[#635BFF] text-white rounded-tr-sm shadow-sm"
                          : "bg-white text-[#0A2540] rounded-tl-sm border border-[#E3E8EF] shadow-sm",
                      )}
                    >
                      {msg.content || (
                        <span className="text-muted-foreground italic text-[12px]">
                          Thinking...
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && !messages[messages.length - 1]?.content && (
                  <div className="flex gap-3 max-w-[90%]">
                    <div className="size-7 rounded-full bg-gradient-to-br from-[#635BFF] to-[#0A2540] flex-shrink-0 flex items-center justify-center shadow-md">
                      <Sparkles className="size-3.5 text-white" />
                    </div>
                    <div className="px-4 py-3 bg-white border border-[#E3E8EF] text-[#0A2540] rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                      <motion.div
                        className="size-1.5 bg-[#635BFF] rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      />
                      <motion.div
                        className="size-1.5 bg-[#635BFF] rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      />
                      <motion.div
                        className="size-1.5 bg-[#635BFF] rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px]">
                    <AlertCircle className="size-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-[#E3E8EF]">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={getContextHint()}
                    className="w-full bg-[#F6F9FC] border border-[#E3E8EF] rounded-full pl-4 pr-12 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 transition-all placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={isTyping ? handleStop : handleSend}
                    disabled={!isTyping && !input.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center bg-[#635BFF] hover:bg-[#4F46E5] text-white rounded-full transition-colors disabled:opacity-50"
                  >
                    {isTyping ? (
                      <StopCircle className="size-3.5" />
                    ) : (
                      <Send className="size-3.5 ml-0.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 px-2">
                  <p className="text-[9px] text-muted-foreground">
                    Powered by Claude — responses cite DORA articles
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            "size-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group",
            isOpen
              ? "bg-[#0A2540] rotate-90 scale-90"
              : "bg-gradient-to-tr from-[#635BFF] to-[#4F46E5] hover:shadow-[#635BFF]/30 hover:shadow-2xl",
          )}
        >
          {isOpen ? (
            <X className="size-6 text-white" />
          ) : (
            <Sparkles className="size-6 text-white" />
          )}
        </motion.button>
      </div>
    </>
  );
}
