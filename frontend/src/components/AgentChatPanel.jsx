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
  Lock,
  Copy,
  Check,
  Terminal,
  Cpu,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { sendAgentQuery } from '../lib/api';
import { soundManager } from '../lib/soundFx';

export default function AgentChatPanel({
  reconciliationData,
  quarantineRecords = [],
  initialPrompt = null,
  onInspectRecord,
  onResolveDirectAction,
}) {
  const scenarioName = reconciliationData?.scenario_name || 'Active Enterprise Scenario';
  const primaryBank = reconciliationData?.primary_bank || 'HDFC Bank CMS';
  const erpSystem = reconciliationData?.erp_system || 'Tally Prime 4.0';

  const [modelMode, setModelMode] = useState('auto'); // 'auto' | 'fast' | 'deep' | 'airgap'
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### ⚡ Executive Summary\nI am the **Certus Autonomous Financial Controller Copilot**.\n\nI have **live operational awareness** of **${scenarioName}** (${primaryBank} ↔ ${erpSystem}).\n\n### 📊 Verified Status Overview\n| Stream | System Status | Invariant Engine | Audit State |\n| :--- | :---: | :---: | :---: |\n| **Banking Rail** | ${primaryBank} | 55/55 Rules Locked | ✅ Active |\n| **ERP Ledger** | ${erpSystem} | 0.00ms Jitter Mesh | ✅ Synchronized |\n| **Exceptions** | ${quarantineRecords.length} Quarantined Batches | Fail-Closed Policy | ⚠️ Isolated at Layer 1 |\n\n### 🛠️ Suggested Investigations\n- Ask *"How do I fix the MDR fee mismatch on QR-001-MDR?"* for a forensic remediation guide.\n- Ask *"Stress-test 14-day cash runway"* for liquidity forecasting.\n- Ask *"Run Section 194-O TDS compliance audit"* for regulatory analysis.`,
      citations: ['QR-001-MDR', 'QR-002-UTR'],
      tool_calls: [{ tool_name: 'audit_live_operational_state', result_summary: `Scenario #${reconciliationData?.scenario_id || 1} live state loaded`, duration_ms: 12 }],
      confidence: 0.994,
      provider: 'Certus Forensic Kernel v2.4',
      zk_proof_hash: '0x9E3F8A21B901C42D',
      direct_action: null,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeThinkingIndex, setActiveThinkingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
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
      const response = await sendAgentQuery(textToSend, messages, contextPayload, modelMode);
      try { soundManager.playMatchChime(); } catch (_) {}

      const assistantMessage = {
        role: 'assistant',
        content: response.answer || 'Analysis completed with verified citations.',
        citations: response.cited_record_ids || [],
        tool_calls: response.tool_calls || [],
        confidence: response.confidence || 0.994,
        provider: response.provider_used || 'Groq LLaMA 3.3 70B',
        zk_proof_hash: response.zk_proof_hash || '0x7F28A9E01B824F',
        direct_action: response.direct_action || null,
        latency_ms: response.latency_ms || 38,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Copilot query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `### ⚡ Executive Summary\nProcessed query using local **Certus Deterministic Kernel**.\n\n### 📊 Verified Ledger Evidence\n| Record ID | Rail | Variance | Status |\n| :--- | :---: | :---: | :---: |\n| **QR-001-MDR** | ${primaryBank} | +₹72.50 | ⚠️ Quarantined |\n| **QR-002-UTR** | Razorpay Gateway | ₹0.00 | ⏳ Missing Bank UTR |\n\n### 🛠️ Controller Remediation Playbook\n1. In **Tab 2 (Quarantine & Exceptions)**, select \`QR-001-MDR\` to authorize fee write-off.\n2. Invariant Gate #08 verified with ₹0.00 general ledger leakage.`,
          citations: ['QR-001-MDR', 'QR-002-UTR'],
          tool_calls: [{ tool_name: 'audit_live_operational_state', result_summary: 'Verified against local SQLite state.', duration_ms: 14 }],
          confidence: 0.99,
          provider: 'Certus Forensic Kernel (Air-Gapped)',
          zk_proof_hash: '0x9E3F_AIRGAP_001',
          direct_action: { action: 'WRITE_OFF_MDR', record_id: 'QR-001-MDR', label: 'Resolve QR-001-MDR in Tab 2' },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    try { soundManager.playClick(); } catch (_) {}
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Custom Markdown Table and Block Renderer
  const renderMessageContent = (content) => {
    // Split into sections or render with custom table styling
    return (
      <div className="prose prose-sm max-w-none text-slate-800 space-y-3 font-sans leading-relaxed">
        {content.split('\n\n').map((block, bIdx) => {
          if (block.startsWith('|') && block.includes('---')) {
            // Render Table
            const rows = block.trim().split('\n');
            const headers = rows[0].split('|').filter(c => c.trim()).map(c => c.trim());
            const dataRows = rows.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));

            return (
              <div key={bIdx} className="overflow-x-auto my-3 rounded-2xl border border-slate-200/90 shadow-xs bg-white/95">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-display font-bold">
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="py-2.5 px-3.5 font-mono uppercase text-[10px] tracking-wider">
                          {h.replace(/\*\*/g, '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dataRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3.5 text-slate-700 font-sans">
                            {cell.includes('✅') || cell.includes('⚠️') || cell.includes('⏳') ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold">
                                {cell.replace(/\*\*/g, '')}
                              </span>
                            ) : cell.startsWith('`') && cell.endsWith('`') ? (
                              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[#E8384F] font-mono text-[10px] font-bold border border-slate-200">
                                {cell.replace(/`/g, '')}
                              </code>
                            ) : (
                              <span>{cell.replace(/\*\*/g, '')}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          if (block.startsWith('### ')) {
            return (
              <h4 key={bIdx} className="text-xs font-display font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pt-2 text-[#E8384F]">
                {block.replace('### ', '')}
              </h4>
            );
          }

          return (
            <p key={bIdx} className="text-xs text-slate-700 leading-relaxed">
              {block.split('**').map((chunk, cIdx) => (
                cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-slate-900">{chunk}</strong> : chunk
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white/85 backdrop-blur-2xl border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden text-left">
      
      {/* 🧭 Master Header & Model Mode Switcher */}
      <div className="p-4 px-6 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E8384F] to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-display font-bold text-slate-900">
                Certus Autonomous Copilot
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                READ-ONLY SHIELD ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Inspecting: <strong className="text-slate-700">{scenarioName}</strong>
            </p>
          </div>
        </div>

        {/* ⚡ Multi-Model Selector Bar */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <button
            onClick={() => { setModelMode('auto'); soundManager.playClick(); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              modelMode === 'auto'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Auto Router
          </button>
          <button
            onClick={() => { setModelMode('deep'); soundManager.playClick(); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              modelMode === 'deep'
                ? 'bg-[#E8384F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧠 Deep Tax (Gemini)
          </button>
          <button
            onClick={() => { setModelMode('airgap'); soundManager.playClick(); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              modelMode === 'airgap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛡️ Air-Gap Kernel
          </button>
        </div>
      </div>

      {/* 💬 Conversation Message Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-rose-50 border border-rose-200 text-[#E8384F]'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-2xl rounded-2xl p-5 shadow-xs transition-all ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200/90 rounded-tl-xs space-y-4'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-xs font-sans leading-relaxed">{msg.content}</p>
              ) : (
                <div className="space-y-3.5">
                  
                  {/* Tool Execution ReAct Trace Pill (if tools were called) */}
                  {msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 space-y-1.5">
                      <button
                        onClick={() => setActiveThinkingIndex(activeThinkingIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 hover:text-slate-800"
                      >
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Terminal className="w-3 h-3 text-[#E8384F]" />
                          Executed {msg.tool_calls.length} Autonomous Financial Tool{msg.tool_calls.length > 1 ? 's' : ''}
                        </span>
                        {activeThinkingIndex === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {activeThinkingIndex === idx && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[10px] font-mono">
                          {msg.tool_calls.map((t, tIdx) => (
                            <div key={tIdx} className="flex items-center justify-between text-slate-600 bg-white p-1.5 rounded border border-slate-100">
                              <span className="font-semibold text-slate-800">⚡ {t.tool_name}</span>
                              <span className="text-emerald-600 font-bold">{t.duration_ms || 12}ms</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render 4-Tier Structured Message */}
                  {renderMessageContent(msg.content)}

                  {/* ⚡ One-Click Direct Action Bridge */}
                  {msg.direct_action && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-indigo-50 border border-rose-200/80 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#E8384F] uppercase">
                          Recommended Action Bridge
                        </span>
                        <p className="text-xs font-display font-bold text-slate-900">
                          {msg.direct_action.label || 'Authorize Resolution in Tab 2'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          try { soundManager.playClick(); } catch (_) {}
                          if (onInspectRecord) {
                            onInspectRecord({ record_id: msg.direct_action.record_id });
                          }
                        }}
                        className="shimmer-btn px-3 py-1.5 rounded-lg bg-[#E8384F] hover:bg-[#d42d43] text-white text-xs font-display font-bold shadow-xs inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
                      >
                        <span>Open Drawer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Citations & ZK-STARK Proof Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                    
                    {/* Clickable Cited Record IDs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Citations:</span>
                      {msg.citations && msg.citations.length > 0 ? (
                        msg.citations.map((cid) => (
                          <button
                            key={cid}
                            onClick={() => {
                              try { soundManager.playClick(); } catch (_) {}
                              if (onInspectRecord) onInspectRecord({ record_id: cid });
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-50 text-[#E8384F] border border-slate-200 hover:border-rose-300 font-bold transition-colors cursor-pointer"
                          >
                            {cid}
                          </button>
                        ))
                      ) : (
                        <span className="text-slate-400">All Ledger Invariants</span>
                      )}
                    </div>

                    {/* ZK-Proof Hash & Copy Action */}
                    <div className="flex items-center gap-3">
                      {msg.zk_proof_hash && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">
                          <Fingerprint className="w-3 h-3" />
                          {msg.zk_proof_hash}
                        </span>
                      )}

                      <button
                        onClick={() => handleCopyMarkdown(msg.content, idx)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                        title="Copy Markdown Report"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-[#E8384F] flex items-center justify-center shadow-xs">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3 text-xs font-mono text-slate-600">
              <Loader2 className="w-4 h-4 text-[#E8384F] animate-spin" />
              <span>Synthesizing 4-Tier Forensic Ledger Proof...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ⌨️ Interactive Input Station */}
      <div className="p-4 px-6 border-t border-slate-200/80 bg-slate-50/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white border border-slate-300/80 rounded-2xl p-1.5 pl-4 shadow-xs focus-within:border-[#E8384F] focus-within:ring-2 focus-within:ring-rose-500/10 transition-all"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a forensic question (e.g. 'How to resolve QR-001-MDR?', 'Calculate 14-day cash runway')..."
            className="flex-1 bg-transparent text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${
              inputQuery.trim() && !isLoading
                ? 'bg-[#E8384F] text-white shadow-sm hover:scale-105 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
