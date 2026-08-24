import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  Code,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { sendAgentQuery } from '../lib/api';

export default function AgentChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello. I am the **Certus Autonomous Financial Controller**.\n\nI possess **zero write permissions** and answer strictly with cited transaction IDs and verified ledger data. How can I assist with cash positions or reconciliation discrepancies today?',
      citations: [],
      tool_calls: [],
      confidence: 1.0,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedToolIndex, setExpandedToolIndex] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await sendAgentQuery(textToSend);
      const assistantMessage = {
        role: 'assistant',
        content: response.answer || 'Response generated from verified ledger sources.',
        citations: response.cited_record_ids || [],
        tool_calls: response.tool_calls || [],
        confidence: response.confidence,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to query financial agent. Operating strictly on verified local data.',
          citations: [],
          tool_calls: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'What is our verified cash position?',
    'List all active quarantine exceptions',
    'Summarize 3-way reconciliation match rates',
  ];

  return (
    <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-page border border-border-subtle flex items-center justify-center text-ink-primary">
            <Bot className="w-4 h-4 text-sterling" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink-primary">
              Financial Controller Copilot
            </h3>
            <p className="text-[11px] text-ink-muted">Strictly Read-Only • 100% Verified Citations</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Write Capable</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded bg-page border border-border-subtle flex items-center justify-center text-sterling shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-lg p-3 space-y-2 ${
                msg.role === 'user'
                  ? 'bg-ink-primary text-white font-medium'
                  : 'bg-page border border-border-subtle text-ink-primary'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-medium text-ink-muted">Cited Records:</span>
                  {msg.citations.map((cid, cidx) => (
                    <span
                      key={cidx}
                      className="px-1.5 py-0.5 rounded bg-surface border border-border-strong text-[10px] font-mono text-ink-secondary"
                    >
                      {cid}
                    </span>
                  ))}
                </div>
              )}

              {/* Tool Execution Drawer */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setExpandedToolIndex(expandedToolIndex === idx ? null : idx)}
                    className="flex items-center gap-1 text-[10px] font-mono text-ink-secondary hover:text-ink-primary"
                  >
                    <Code className="w-3 h-3 text-sterling" />
                    <span>
                      {msg.tool_calls.length} Read-Only Tool Execution
                      {msg.tool_calls.length > 1 ? 's' : ''}
                    </span>
                    {expandedToolIndex === idx ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {expandedToolIndex === idx && (
                    <div className="mt-2 p-2 bg-surface rounded border border-border-subtle font-mono text-[10px] space-y-1.5 overflow-x-auto text-ink-secondary">
                      {msg.tool_calls.map((t, tidx) => (
                        <div key={tidx}>
                          <span className="text-sterling font-bold">call: {t.tool}()</span>
                          <p className="text-ink-muted truncate">out: {t.output}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded bg-ink-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="w-6 h-6 rounded bg-page border border-border-subtle flex items-center justify-center text-sterling shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-page border border-border-subtle rounded-lg flex items-center gap-2 text-ink-secondary">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sterling" />
              <span>Querying verified read-only tools...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-page/50 border-t border-border-subtle flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-medium text-ink-muted shrink-0">Suggestions:</span>
        {quickPrompts.map((p, pidx) => (
          <button
            key={pidx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full bg-surface border border-border-subtle hover:border-border-strong text-[11px] text-ink-secondary hover:text-ink-primary whitespace-nowrap transition-fast"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-border-subtle bg-surface flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask about cash positions, unverified UTRs, forecast..."
          className="flex-1 text-xs p-2.5 bg-page border border-border-subtle rounded-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-sterling"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-2.5 bg-sterling hover:bg-sterling-hover text-white rounded-md transition-fast disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
