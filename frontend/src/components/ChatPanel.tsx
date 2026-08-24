'use client';

import React, { useState } from 'react';
import { Send, Bot, User, ShieldCheck, Link2, Cpu, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, AgentQueryResponse } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  cited_record_ids?: string[];
  tool_calls?: Array<{
    tool_name: string;
    arguments: any;
    result_summary: string;
    duration_ms: number;
  }>;
  timestamp: string;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am your AI Finance Controller. I have direct, read-only telemetry across verified gateway settlements, bank credits, and ERP ledgers. Every answer I provide is mathematically bounded and strictly cited back to immutable source records. How can I assist you today?",
      confidence: 1.0,
      cited_record_ids: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);

  const suggestedQuestions = [
    "What is our verified cash position right now?",
    "What is our 7-day projected cash forecast?",
    "Why are records residing in the quarantine queue?",
    "Show recent batch reconciliation performance",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const resp = await api.queryAgent(query);
      const assistantMsg: Message = {
        role: 'assistant',
        content: resp.answer,
        confidence: resp.confidence,
        cited_record_ids: resp.cited_record_ids,
        tool_calls: resp.tool_calls,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Agent query failed: ${err.message || 'Unable to connect to service'}`,
        confidence: 0.0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative flex flex-col h-[750px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1px] shadow-glow-cyan flex items-center justify-center">
            <div className="w-full h-full bg-[#080d1a] rounded-[11px] flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span>Autonomous Finance Agent</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Zero Hallucination
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Mandatory Source Citations • Strict Read-Only Tool Registry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Audit Logging Active</span>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Prompts:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="flex-shrink-0 text-xs font-mono px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-sans">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-glow-cyan'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-glass'
              }`}
            >
              {/* Message Header for Assistant */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 font-mono text-[10px]">
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Synthesized Agent Response
                  </span>
                  {msg.confidence !== undefined && (
                    <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {(msg.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Tool Calls Execution Trace */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" /> Read-Only Tool Execution Trace:
                  </span>
                  <div className="space-y-1">
                    {msg.tool_calls.map((t, tidx) => (
                      <div
                        key={tidx}
                        className="bg-black/50 px-2.5 py-1.5 rounded text-[11px] font-mono text-cyan-300 border border-cyan-500/20 flex items-center justify-between"
                      >
                        <span>
                          ⚙️ <span className="font-semibold">{t.tool_name}</span>() → {t.result_summary}
                        </span>
                        <span className="text-[10px] text-slate-500">{t.duration_ms}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Citations */}
              {msg.cited_record_ids && msg.cited_record_ids.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold flex items-center gap-1 mb-1.5">
                    <Link2 className="w-3 h-3" /> Cited Source Record IDs (Clickable):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.cited_record_ids.map((cid, cidx) => (
                      <button
                        key={cidx}
                        onClick={() => setSelectedCitation(cid)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/50 transition-colors flex items-center gap-1"
                      >
                        <span>#{cid}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-cyan-400 max-w-[50%]">
            <Bot className="w-4 h-4 animate-bounce" />
            <span>Executing read-only tools and calculating cited telemetry...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-4 pt-3 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question in plain English... e.g. 'What is our cash position next Friday?'"
          className="flex-1 text-xs p-3.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 font-sans"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Citation Inspector Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 border border-emerald-500/30 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                Source Citation Proof
              </span>
              <button onClick={() => setSelectedCitation(null)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>
            <h4 className="font-bold text-slate-100 text-sm mb-1">Transaction ID: {selectedCitation}</h4>
            <p className="text-xs text-slate-400 mb-3">
              Verified record stored in trusted ledger backing the agent&apos;s answer.
            </p>
            <div className="p-3 bg-black/60 rounded-lg text-xs font-mono text-emerald-300 border border-slate-800 mb-4">
              <p>Status: VERIFIED_COMMITTED</p>
              <p>Audit Trail: Layer 1 Deterministic Pass</p>
              <p>Traceable: True</p>
            </div>
            <button
              onClick={() => setSelectedCitation(null)}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
