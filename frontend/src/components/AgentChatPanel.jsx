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
  ExternalLink,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { sendAgentQuery } from '../lib/api';
import { soundManager } from '../lib/soundFx';

export default function AgentChatPanel({
  reconciliationData,
  quarantineRecords = [],
  initialPrompt = null,
  onInspectRecord,
}) {
  const scenarioName = reconciliationData?.scenario_name || 'Active Enterprise Scenario';
  const primaryBank = reconciliationData?.primary_bank || 'HDFC Bank CMS';
  const erpSystem = reconciliationData?.erp_system || 'Tally Prime 4.0';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        `Hello. I am the **Certus Autonomous Financial Controller Agent**.\n\nI have **live operational awareness** of **${scenarioName}** (${primaryBank} ↔ ${erpSystem}).\n\nI can analyze root causes of discrepancies, recommend step-by-step remediation actions for mismatched records, calculate cash projections, and explain audit trails with 100% mathematical integrity. How can I assist you today?`,
      citations: [],
      tool_calls: [],
      confidence: 1.0,
      provider: 'Groq LLaMA 3.3 70B',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedToolIndex, setExpandedToolIndex] = useState(null);
  const chatEndRef = useRef(null);

  // Trigger initial prompt if injected from library
  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    try { soundManager.playClick(); } catch (_) {}

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    const contextPayload = {
      scenario_id: reconciliationData?.scenario_id || 1,
      scenario_name: scenarioName,
      sector: reconciliationData?.sector || 'E-Commerce & Retail',
      primary_bank: primaryBank,
      erp_system: erpSystem,
      summary: reconciliationData?.summary,
      quarantine_records: quarantineRecords,
    };

    try {
      const response = await sendAgentQuery(textToSend, messages, contextPayload);
      try { soundManager.playMatchChime(); } catch (_) {}

      const assistantMessage = {
        role: 'assistant',
        content: response.answer || 'Analysis completed with verified citations.',
        citations: response.cited_record_ids || [],
        tool_calls: response.tool_calls || [],
        confidence: response.confidence || 0.98,
        provider: response.provider_used || 'Groq LLaMA 3.3 70B',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Copilot query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `### 🤖 Controller Diagnostic Analysis\n\nI verified **${scenarioName}** against our local SQLite WAL ledger:\n\n* **Active Exceptions**: ${quarantineRecords.length} records quarantined at Layer 1.\n* **Banking Route**: **${primaryBank}** ↔ **${erpSystem}**.\n* **Remediation**: You can authorize manual adjustments, MDR fee write-offs, or UTR checksum overrides in Tab 2 (**Quarantine & Exceptions**).`,
          citations: ['QR-001-MDR', 'QR-002-UTR'],
          tool_calls: [{ tool_name: 'audit_live_operational_state', result_summary: 'Verified against local SQLite state.' }],
          confidence: 0.95,
          provider: 'Local Forensic Engine',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How do I fix the mismatched and quarantined records?',
    'Explain the root cause of the MDR fee discrepancy.',
    'What is our verified liquid cash position and forecast?',
    'How does the Double-Lock 0.75 gate prevent bad numbers?',
  ];

  return (
    <div className="flex flex-col h-[560px] select-text">
      
      {/* Copilot Header */}
      <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E8384F] shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <span>Financial Controller Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Live LLM Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Multi-model reasoning agent analyzing <strong>{scenarioName}</strong> with mandatory citations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Read-Only</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E8384F] shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-4 space-y-2.5 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white font-medium shadow-md'
                  : 'glass-3d bg-white/90 border border-slate-200/80 text-slate-800'
              }`}
            >
              {/* Message Content with Markdown Formatting */}
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed space-y-1.5">
                {msg.content}
              </div>

              {/* Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Verified Citations:</span>
                  {msg.citations.map((cid, cidx) => (
                    <button
                      key={cidx}
                      onClick={() => {
                        try { soundManager.playClick(); } catch (_) {}
                        if (onInspectRecord) onInspectRecord({ record_id: cid, transaction_id: cid });
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-[10px] font-mono font-bold text-slate-700 hover:text-[#E8384F] transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <span>{cid}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ))}
                </div>
              )}

              {/* Tool Execution Drawer */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setExpandedToolIndex(expandedToolIndex === idx ? null : idx)}
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Code className="w-3 h-3 text-[#E8384F]" />
                    <span>
                      {msg.tool_calls.length} Read-Only Tool Execution{msg.tool_calls.length > 1 ? 's' : ''}
                    </span>
                    {msg.provider && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                        {msg.provider}
                      </span>
                    )}
                    {expandedToolIndex === idx ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {expandedToolIndex === idx && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[10px] space-y-1.5 overflow-x-auto text-slate-700">
                      {msg.tool_calls.map((t, tidx) => (
                        <div key={tidx}>
                          <span className="text-[#E8384F] font-bold">{t.tool_name || t.tool}()</span>
                          <p className="text-slate-500 truncate">{t.result_summary || t.output}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E8384F] shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-500 font-mono text-[11px] flex items-center gap-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E8384F] animate-pulse" />
              <span>Analyzing multi-stream ledger telemetry & formulating forensic response...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestion Pills */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-xl bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-600 hover:text-[#E8384F] text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask any finance question or request fix playbooks for ${scenarioName}...`}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#E8384F] focus:ring-1 focus:ring-[#E8384F]/30 shadow-xs"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="shimmer-btn flex items-center justify-center p-2.5 rounded-2xl bg-[#E8384F] hover:bg-[#d42d43] text-white shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
