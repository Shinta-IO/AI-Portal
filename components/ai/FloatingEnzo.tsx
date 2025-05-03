"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";

export default function FloatingEnzo() {
  const [isOpen, setIsOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, `🧑‍💻: ${userMsg}`]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, `🤖 Enzo: ${data.result}`]);
    } catch (err) {
      setMessages((prev) => [...prev, "🤖 Enzo: Something went wrong."]);
    }

    setThinking(false);
  };

  return (
    <>
      {/* Toggle FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg text-black transition-all
            ${isOpen ? "bg-red-500 hover:bg-red-600 text-white" : "bg-brand-yellow hover:bg-brand-orange"}`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          <span>{isOpen ? "Close" : "Ask Enzo"}</span>
        </button>
      </div>

      {/* Floating Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-[90vw] max-w-md rounded-xl shadow-xl
                       border border-brand-muted dark:border-brand-blue bg-white dark:bg-zinc-900 flex flex-col overflow-hidden"
          >
            <div className="p-4 text-brand-primary dark:text-brand-accent font-semibold border-b dark:border-zinc-700">
              Enzo AI Assistant
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm text-zinc-800 dark:text-zinc-200 max-h-80">
              {messages.length === 0 && (
                <p className="text-zinc-500 dark:text-zinc-400">Ask Enzo anything about your projects or this platform.</p>
              )}
              {messages.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
              {thinking && <p className="italic text-yellow-500">Enzo is thinking...</p>}
            </div>

            <div className="border-t dark:border-zinc-700 p-3 bg-zinc-100 dark:bg-zinc-800 flex gap-2">
              <input
                className="flex-1 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 text-sm border border-zinc-300 dark:border-zinc-700 outline-none"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 bg-brand-yellow text-black font-semibold text-sm rounded-md hover:bg-brand-orange transition"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
