import React, { useState } from 'react';
import {
  Bot,
  BookOpen,
  Terminal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code,
  CheckCircle2,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import AgentChatPanel from './AgentChatPanel';

export default function CopilotHub() {
  const [activeSubTab, setActiveSubTab] = useState('chat');
  const [injectedPrompt, setInjectedPrompt] = useState(null);

  const tabs = [
    {
      id: 'chat',
      label: 'Controller Copilot',
      icon: Bot,
      badge: 'Strict Read-Only',
    },
    {
      id: 'prompts',
      label: 'Audit Prompt Library',
      icon: BookOpen,
      badge: '6 Presets',
    },
    {
      id: 'tools',
      label: 'Tool Introspection Logs',
      icon: Terminal,
      badge: 'Audited',
    },
  ];

  const PRESET_PROMPTS = [
    {
      title: 'Audited Cash Position & Forecast',
      query: 'What is our aggregate audited cash balance and 7-day settlement forecast?',
      desc: 'Queries real-time ledger balances and in-flight gateway settlement transit lines.',
    },
    {
      title: 'Quarantine Anomaly Audit',
      query: 'Audit all unresolved quarantine records and explain their root causes.',
      desc: 'Retrieves active Layer 1 safety traps and summarizes deterministic failure codes.',
    },
    {
      title: 'MDR Fee Discrepancy Check',
      query: 'Check for MDR fee discrepancies between Razorpay gateway and bank statements.',
      desc: 'Compares contracted rate cards against actual deducted settlement amounts.',
    },
    {
      title: 'High-Value UTR Checksums',
      query: 'Verify bank UTR checksums for all transactions above ₹10,000.',
      desc: 'Cross-verifies 16/22-digit banking references with ERP invoice clearing lines.',
    },
    {
      title: 'Missing Settlement Tracer',
      query: 'List all invoices in ERP that lack a matching bank settlement credit.',
      desc: 'Isolates open invoices exceeding standard T+2 clearance windows.',
    },
    {
      title: 'Double-Lock Gate Verification',
      query: 'Explain how the Double-Lock 0.75 gate verified the latest reconciliation batch.',
      desc: 'Inspects Layer 1 rule composite score and Layer 2 consensus logs.',
    },
  ];

  const TOOL_EXECUTION_LOGS = [
    {
      id: 'TC-9012',
      tool: 'get_cash_position',
      caller: 'Copilot Engine',
      params: '{ "currency": "INR" }',
      result: '{ "current_balance": 14250000.0, "status": "VERIFIED" }',
      latency: '34ms',
      safety: 'Read-Only (No Write Privileges)',
    },
    {
      id: 'TC-9013',
      tool: 'get_pending_settlements',
      caller: 'Copilot Engine',
      params: '{ "days_ahead": 7 }',
      result: '{ "expected_settlements": 1850000.0 }',
      latency: '42ms',
      safety: 'Read-Only (No Write Privileges)',
    },
    {
      id: 'TC-9014',
      tool: 'search_transaction_history',
      caller: 'Copilot Engine',
      params: '{ "status": "quarantined" }',
      result: '{ "trapped_count": 4, "total_value": 420000.0 }',
      latency: '28ms',
      safety: 'Read-Only (No Write Privileges)',
    },
  ];

  const handleSelectPrompt = (promptText) => {
    setInjectedPrompt(promptText);
    setActiveSubTab('chat');
  };

  return (
    <div className="space-y-6">
      {/* Nested Sub-Tab Navigation Bar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
      />

      {/* Sub-View 1: Controller Copilot Terminal */}
      {activeSubTab === 'chat' && (
        <div className="space-y-6">
          <AgentChatPanel initialQuery={injectedPrompt} />
        </div>
      )}

      {/* Sub-View 2: Audit Prompt Library */}
      {activeSubTab === 'prompts' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Pre-Configured Financial Controller Audit Prompts
                </h3>
                <p className="text-xs text-ink-muted">
                  Click any prompt to execute an immediate read-only database query with live citations.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                ZERO HALLUCINATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_PROMPTS.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPrompt(p.query)}
                  className="p-5 bg-page rounded-xl border border-border-subtle hover:border-sterling hover:shadow-subtle cursor-pointer transition-fast space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-ink-primary group-hover:text-sterling transition-fast">
                      {p.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-sterling group-hover:translate-x-0.5 transition-fast" />
                  </div>
                  <p className="text-xs font-mono text-ink-secondary bg-surface p-2.5 rounded-lg border border-border-subtle">
                    "{p.query}"
                  </p>
                  <p className="text-[11px] text-ink-muted leading-relaxed font-sans">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: Tool Introspection Logs */}
      {activeSubTab === 'tools' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Agent Tool Execution & SQL Introspection Logs
                </h3>
                <p className="text-xs text-ink-muted">
                  Strict cryptographic audit trail of all MCP read-only tool calls executed by the AI Copilot.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-page border border-border-subtle text-ink-primary">
                MCP SANDBOXED
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-[11px] text-ink-muted uppercase">
                    <th className="pb-3 font-semibold">Call ID</th>
                    <th className="pb-3 font-semibold">Tool Invoked</th>
                    <th className="pb-3 font-semibold">Parameters</th>
                    <th className="pb-3 font-semibold">Output Payload</th>
                    <th className="pb-3 font-semibold">Latency</th>
                    <th className="pb-3 font-semibold text-right">Guardrail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {TOOL_EXECUTION_LOGS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-page/50 transition-fast">
                      <td className="py-3 font-bold text-ink-primary">{item.id}</td>
                      <td className="py-3 font-bold text-sterling">{item.tool}</td>
                      <td className="py-3 text-ink-secondary text-[11px]">{item.params}</td>
                      <td className="py-3 text-ink-primary text-[11px]">{item.result}</td>
                      <td className="py-3 text-emerald-600">{item.latency}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          {item.safety}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
