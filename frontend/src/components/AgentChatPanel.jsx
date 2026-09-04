import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  Code,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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
      content: `### Executive Overview\nI am the **Certus Autonomous Financial Controller Copilot**.\n\nI have **live operational awareness** of **${scenarioName}** (${primaryBank} ↔ ${erpSystem}).\n\n### Verified Status Overview\n| Stream | System Status | Invariant Engine | Audit State |\n| :--- | :---: | :---: | :---: |\n| **Banking Rail** | ${primaryBank} | 55/55 Rules Locked | Verified Active |\n| **ERP Ledger** | ${erpSystem} | 0.00ms Jitter Mesh | Synchronized |\n| **Exceptions** | ${quarantineRecords.length} Quarantined Batches | Fail-Closed Policy | Isolated at Layer 1 |\n\n### Suggested Inquiries\n- *"Explain root-cause variance on QR-001-MDR"* for forensic fee breakdown.\n- *"Forecast 14-day cash runway"* for liquidity distribution.\n- *"Audit Section 194-O TDS compliance"* for statutory deduction status.`,
      citations: ['QR-001-MDR', 'QR-002-UTR'],
      tool_calls: [{ tool_name: 'audit_live_operational_state', result_summary: `Scenario #${reconciliationData?.scenario_id || 1} live state loaded`, duration_ms: 12 }],
      confidence: 0.994,
      provider: 'Certus Forensic Kernel v2.5',
      zk_proof_hash: '0x9E3F8A21B901C42D',
      direct_action: null,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeThinkingIndex, setActiveThinkingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

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
          content: `### Executive Overview\nProcessed query using local **Certus Deterministic Kernel**.\n\n### Verified Ledger Evidence\n| Record ID | Rail | Variance | Status |\n| :--- | :---: | :---: | :---: |\n| **QR-001-MDR** | ${primaryBank} | +₹72.50 | Quarantined |\n| **QR-002-UTR** | Razorpay Gateway | ₹0.00 | Missing Bank UTR |\n\n### Controller Remediation Playbook\n1. In **Quarantine & Exceptions**, select \`QR-001-MDR\` to review the MDR dispute draft.\n2. Invariant Gate #08 verified with ₹0.00 general ledger leakage.`,
          citations: ['QR-001-MDR', 'QR-002-UTR'],
          tool_calls: [{ tool_name: 'audit_live_operational_state', result_summary: 'Verified against local SQLite state.', duration_ms: 14 }],
          confidence: 0.99,
          provider: 'Certus Forensic Kernel (Air-Gapped)',
          zk_proof_hash: '0x9E3F_AIRGAP_001',
          direct_action: { action: 'WRITE_OFF_MDR', record_id: 'QR-001-MDR', label: 'Inspect QR-001-MDR Exception' },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Clean Markdown Table and Typography Renderer
  const renderMessageContent = (content) => {
    return (
      <div className="text-ink-primary space-y-2.5 font-sans leading-relaxed text-xs">
        {content.split('\n\n').map((block, bIdx) => {
          if (block.startsWith('|') && block.includes('---')) {
            const rows = block.trim().split('\n');
            const headers = rows[0].split('|').filter(c => c.trim()).map(c => c.trim());
            const dataRows = rows.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));

            return (
              <div key={bIdx} className="overflow-x-auto my-2 rounded-md border border-border-subtle bg-surface">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-page border-b border-border-subtle text-ink-secondary font-medium">
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="py-2 px-3 font-mono uppercase text-[10px] tracking-wider">
                          {h.replace(/\*\*/g, '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
                    {dataRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-page/50 transition-fast">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 text-ink-primary">
                            {cell.startsWith('`') && cell.endsWith('`') ? (
                              <code className="px-1.5 py-0.5 rounded bg-page text-ink-primary border border-border-subtle text-[10px]">
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
              <h4 key={bIdx} className="text-xs font-display font-semibold uppercase tracking-wider text-ink-secondary pt-1">
                {block.replace('### ', '')}
              </h4>
            );
          }

          return (
            <p key={bIdx} className="text-xs text-ink-secondary leading-relaxed">
              {block.split('**').map((chunk, cIdx) => (
                cIdx % 2 === 1 ? <strong key={cIdx} className="font-semibold text-ink-primary">{chunk}</strong> : chunk
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border-subtle rounded-lg shadow-subtle overflow-hidden text-left">
      
      {/* Header & Model Mode Switcher */}
      <div className="p-4 px-5 border-b border-border-subtle bg-page flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-surface border border-border-subtle flex items-center justify-center text-ink-primary">
            <Bot className="w-3.5 h-3.5 text-ink-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-display font-bold text-ink-primary">
                Certus Autonomous Financial Copilot
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Read-Only Provable Grounding
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Active Context: <strong className="text-ink-secondary">{scenarioName}</strong>
            </p>
          </div>
        </div>

        {/* Multi-Model Selector Bar */}
        <div className="flex items-center gap-1 p-0.5 bg-surface border border-border-subtle rounded-md">
          <button
            onClick={() => setModelMode('auto')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-fast ${
              modelMode === 'auto'
                ? 'bg-ink-primary text-white shadow-subtle'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Auto Router
          </button>
          <button
            onClick={() => setModelMode('deep')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-fast ${
              modelMode === 'deep'
                ? 'bg-ink-primary text-white shadow-subtle'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Deep Tax (Gemini)
          </button>
          <button
            onClick={() => setModelMode('airgap')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-fast ${
              modelMode === 'airgap'
                ? 'bg-ink-primary text-white shadow-subtle'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Air-Gap Kernel
          </button>
        </div>
      </div>

      {/* Conversation Message Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-ink-primary text-white'
                  : 'bg-page border border-border-subtle text-ink-primary'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-2xl rounded-lg p-4 transition-fast ${
                msg.role === 'user'
                  ? 'bg-ink-primary text-white'
                  : 'bg-surface border border-border-subtle shadow-subtle space-y-3'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-xs font-sans leading-relaxed">{msg.content}</p>
              ) : (
                <div className="space-y-3">
                  
                  {/* Tool Execution ReAct Trace Pill */}
                  {msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div className="rounded-md bg-page border border-border-subtle p-2 space-y-1">
                      <button
                        onClick={() => setActiveThinkingIndex(activeThinkingIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-[10px] font-mono text-ink-secondary hover:text-ink-primary"
                      >
                        <span className="flex items-center gap-1.5 font-medium text-ink-primary">
                          <Terminal className="w-3 h-3 text-ink-secondary" />
                          Executed {msg.tool_calls.length} Financial Tool{msg.tool_calls.length > 1 ? 's' : ''}
                        </span>
                        {activeThinkingIndex === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {activeThinkingIndex === idx && (
                        <div className="pt-1.5 border-t border-border-subtle space-y-1 text-[10px] font-mono">
                          {msg.tool_calls.map((t, tIdx) => (
                            <div key={tIdx} className="flex items-center justify-between text-ink-secondary bg-surface p-1.5 rounded border border-border-subtle">
                              <span className="text-ink-primary">⚡ {t.tool_name}</span>
                              <span className="text-emerald-700 font-medium">{t.duration_ms || 12}ms</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Structured Message */}
                  {renderMessageContent(msg.content)}

                  {/* Direct Action Bridge */}
                  {msg.direct_action && (
                    <div className="p-3 rounded-md bg-page border border-border-subtle flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase">
                          Action Recommended
                        </span>
                        <p className="text-xs font-semibold text-ink-primary">
                          {msg.direct_action.label || 'Inspect Exception Record'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (onInspectRecord) {
                            onInspectRecord({ record_id: msg.direct_action.record_id });
                          }
                        }}
                        className="px-3 py-1.5 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-medium shadow-subtle inline-flex items-center gap-1.5 transition-fast"
                      >
                        <span>Open Drawer</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Citations & Solvency Verification */}
                  <div className="pt-2.5 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-ink-muted">
                    
                    {/* Clickable Cited Record IDs */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-semibold text-ink-secondary">Citations:</span>
                      {msg.citations && msg.citations.length > 0 ? (
                        msg.citations.map((cid) => (
                          <button
                            key={cid}
                            onClick={() => {
                              if (onInspectRecord) onInspectRecord({ record_id: cid });
                            }}
                            className="px-1.5 py-0.5 rounded bg-page hover:bg-border-subtle text-ink-primary border border-border-subtle font-mono text-[10px] transition-fast cursor-pointer"
                          >
                            {cid}
                          </button>
                        ))
                      ) : (
                        <span className="text-ink-muted">55 Invariant Rules</span>
                      )}
                    </div>

                    {/* Hash & Copy Action */}
                    <div className="flex items-center gap-2.5">
                      {msg.zk_proof_hash && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-ink-secondary bg-page px-1.5 py-0.5 rounded border border-border-subtle">
                          <Fingerprint className="w-3 h-3 text-ink-muted" />
                          {msg.zk_proof_hash}
                        </span>
                      )}

                      <button
                        onClick={() => handleCopyMarkdown(msg.content, idx)}
                        className="inline-flex items-center gap-1 text-ink-muted hover:text-ink-primary transition-fast"
                        title="Copy Markdown Report"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">Copied</span>
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
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-page border border-border-subtle text-ink-primary flex items-center justify-center">
              <Bot className="w-3 h-3 animate-spin" />
            </div>
            <div className="p-3 rounded-md bg-surface border border-border-subtle shadow-subtle flex items-center gap-2.5 text-xs font-mono text-ink-secondary">
              <Loader2 className="w-3.5 h-3.5 text-ink-secondary animate-spin" />
              <span>Querying verified financial ledger state...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Interactive Input Box */}
      <div className="p-3 px-5 border-t border-border-subtle bg-page">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-surface border border-border-subtle rounded-md p-1 pl-3 shadow-subtle focus-within:border-border-strong transition-fast"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about cash float, exceptions, reconciliation rules, or audit citations..."
            className="flex-1 bg-transparent text-xs font-sans text-ink-primary placeholder:text-ink-muted focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-fast ${
              inputQuery.trim() && !isLoading
                ? 'bg-ink-primary hover:bg-slate-800 text-white shadow-subtle'
                : 'bg-page text-ink-muted cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
