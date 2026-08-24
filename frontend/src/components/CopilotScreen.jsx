import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, FileText, ChevronRight } from "lucide-react";

const INIT_MESSAGES = [
  {
    id: 1,
    role: "user",
    text: "Can you summarize the unmatched exceptions for the APAC region this morning?",
  },
  {
    id: 2,
    role: "assistant",
    text: `I've analyzed the APAC ledger for this morning's batch. There are currently **3 unresolved exceptions** requiring attention, totaling **$4.2M USD** in discrepancy.

• A timing mismatch on a wire transfer from SG Branch. Expected T+1 settlement but received T+2.
• A missing counterparty reference on a block trade allocation.
• A duplicate ledger entry for FX conversion fees on JPY/USD cross.

Would you like me to draft query emails to the respective operations desks?`,
    refs: ["#TX-4029", "#TX-4031"],
  },
];

const SUGGESTIONS = ["Analyze Q2 Variance", "Unreconciled Trades > $1M"];

function MarkdownText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

function AssistantMessage({ msg }) {
  const lines = msg.text.split("\n").filter(Boolean);
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
          <Bot className="w-3.5 h-3.5" style={{ color: "#6366F1" }} />
        </div>
        <span className="font-semibold text-sm" style={{ color: "#6366F1" }}>Certus AI</span>
      </div>
      <div className="text-sm text-ink-secondary font-sans leading-relaxed space-y-1.5">
        {lines.map((line, i) => {
          if (line.startsWith("•")) {
            return (
              <div key={i} className="flex items-start gap-2 ml-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ink-muted flex-shrink-0" />
                <MarkdownText text={line.slice(1).trim()} />
              </div>
            );
          }
          return <p key={i}><MarkdownText text={line} /></p>;
        })}
      </div>
      {msg.refs && (
        <div className="flex items-center gap-2 mt-4">
          {msg.refs.map((ref) => (
            <span key={ref} className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-border-subtle bg-surface-subtle text-xs font-mono text-ink-secondary cursor-pointer hover:border-border-strong transition-colors">
              <FileText className="w-3 h-3" />
              {ref}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CopilotScreen() {
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "I'm analyzing the data now. Based on the current ledger state, I'll have a detailed report ready shortly. In the meantime, I can see there are **2 flagged entries** that match your query criteria.",
        },
      ]);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] animate-fade-in">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Certus AI Copilot</h1>
        <p className="text-sm text-ink-muted mt-2 font-sans">Your intelligent assistant for institutional ledger analysis and reconciliation.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex justify-center">
                <div className="bg-surface border border-border-subtle rounded-xl px-5 py-3 max-w-2xl shadow-subtle">
                  <p className="text-sm text-ink-primary font-sans">{msg.text}</p>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <AssistantMessage msg={msg} />
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: "#6366F1" }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: "#6366F1" }}>Certus AI</span>
              </div>
              <div className="flex items-center gap-1">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-ink-muted"
                    style={{ animation: `pulse 1s ease-in-out ${delay}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 pb-4 pt-2 border-t border-border-subtle bg-surface">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-surface border border-border-subtle rounded-xl px-4 py-3 shadow-subtle focus-within:border-border-strong transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask about cash positions or exceptions..."
              className="flex-1 text-sm bg-transparent outline-none font-sans text-ink-primary placeholder-ink-muted"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#E8384F,#D02B41)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {/* Suggestions */}
          <div className="flex items-center gap-2 mt-2 justify-center">
            <span className="text-xs text-ink-muted font-sans">Suggested:</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => handleSend(s)}
                className="text-xs text-ink-secondary hover:text-ink-primary hover:underline transition-colors font-sans">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
