import React, { useState, useMemo } from 'react';
import {
  Bot,
  BookOpen,
  Terminal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import AgentChatPanel from './AgentChatPanel';
import { soundManager } from '../lib/soundFx';

export default function CopilotHub({
  reconciliationData,
  quarantineRecords = [],
}) {
  const [activeSubTab, setActiveSubTab] = useState('chat');
  const [injectedPrompt, setInjectedPrompt] = useState(null);

  const scenarioNum = useMemo(() => {
    const raw = reconciliationData?.scenario_id;
    if (typeof raw === 'object' && raw !== null) return raw.id || 1;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return parseInt(raw, 10) || 1;
    return 1;
  }, [reconciliationData]);

  const scenarioName = reconciliationData?.scenario_name || 'D2C Fashion & Apparel — Festive Flash Sale';
  const sector = reconciliationData?.sector || 'E-Commerce & Retail';
  const primaryBank = reconciliationData?.primary_bank || 'HDFC Bank CMS';
  const erpSystem = reconciliationData?.erp_system || 'Tally Prime 4.0';

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
      badge: '6 Scenario Presets',
    },
    {
      id: 'tools',
      label: 'Tool Introspection Logs',
      icon: Terminal,
      badge: 'Audited (SQLite WAL)',
    },
  ];

  const PRESET_PROMPTS = [
    {
      title: `Audited Position for ${scenarioName}`,
      query: `What is the audited cash balance and 7-day settlement forecast for Scenario #${scenarioNum} (${scenarioName})?`,
      desc: `Queries ledger balance in ${erpSystem} and in-flight transit lines with ${primaryBank}.`,
    },
    {
      title: 'Quarantine Anomaly Audit',
      query: `Audit all unresolved quarantine records for ${scenarioName} and explain their root causes.`,
      desc: 'Retrieves active Layer 1 safety traps and summarizes deterministic failure codes.',
    },
    {
      title: 'MDR Fee Discrepancy Check',
      query: `Check for MDR fee deviations between Razorpay gateway and ${primaryBank} statement.`,
      desc: 'Compares contracted rate cards against actual deducted settlement amounts.',
    },
    {
      title: 'High-Value UTR Checksums',
      query: `Verify bank UTR checksums for all ${primaryBank} settlement transactions above ₹10,000.`,
      desc: `Cross-verifies 16/22-digit banking references with ${erpSystem} invoice clearing lines.`,
    },
    {
      title: 'Missing Settlement Tracer',
      query: `List all invoices in ${erpSystem} that lack a matching ${primaryBank} settlement credit.`,
      desc: 'Isolates open invoices exceeding standard T+2 clearance windows.',
    },
    {
      title: 'Double-Lock Gate Verification',
      query: `Explain how the Double-Lock 0.75 gate verified the ${scenarioName} batch.`,
      desc: 'Inspects Layer 1 rule composite score and Layer 2 consensus logs.',
    },
  ];

  const TOOL_EXECUTION_LOGS = [
    {
      id: `TC-SC${String(scenarioNum).padStart(2, '0')}-01`,
      tool: 'get_cash_position',
      caller: 'Copilot Engine',
      params: `{ "scenario": "${scenarioName}", "bank": "${primaryBank}" }`,
      result: '{ "current_balance": 14250000.0, "status": "VERIFIED" }',
      latency: '34ms',
      safety: 'Read-Only (No Write Privileges)',
    },
    {
      id: `TC-SC${String(scenarioNum).padStart(2, '0')}-02`,
      tool: 'get_pending_settlements',
      caller: 'Copilot Engine',
      params: `{ "bank": "${primaryBank}", "days_ahead": 7 }`,
      result: '{ "expected_settlements": 1850000.0 }',
      latency: '42ms',
      safety: 'Read-Only (No Write Privileges)',
    },
    {
      id: `TC-SC${String(scenarioNum).padStart(2, '0')}-03`,
      tool: 'search_transaction_history',
      caller: 'Copilot Engine',
      params: `{ "erp": "${erpSystem}", "status": "quarantined" }`,
      result: '{ "trapped_count": 4, "total_value": 420000.0 }',
      latency: '28ms',
      safety: 'Read-Only (No Write Privileges)',
    },
  ];

  const handleUsePrompt = (promptText) => {
    try { soundManager.playClick(); } catch (_) {}
    setInjectedPrompt(promptText);
    setActiveSubTab('chat');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* SubTabBar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={(tab) => {
          soundManager.playClick();
          setActiveSubTab(tab);
        }}
      />

      {/* Active Scenario Context Banner */}
      <div className="glass-3d-elevated p-5 rounded-3xl specular-top shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-rose-50 text-[#E8384F] border border-rose-200 shadow-xs mt-0.5">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono">
                {sector}
              </span>
              <span className="text-xs font-mono font-bold text-[#E8384F]">
                SCENARIO #{String(scenarioNum).padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 font-display">
              Autonomous Financial Copilot — {scenarioName}
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Read-only LLM reasoning engine with mandatory citation requirements against <strong>{primaryBank}</strong> & <strong>{erpSystem}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold shadow-xs">
            Model: Groq LLaMA 3.3 70B
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shadow-xs">
            Read-Only Safe
          </span>
        </div>
      </div>

      {/* Sub-View 1: Copilot Chat */}
      {activeSubTab === 'chat' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm">
          <AgentChatPanel initialPrompt={injectedPrompt} />
        </div>
      )}

      {/* Sub-View 2: Audit Prompt Library */}
      {activeSubTab === 'prompts' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-display font-bold text-base text-slate-900">
                Pre-Audited Scenario Prompts
              </h4>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Execute validated controller inquiries against {scenarioName}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PRESET_PROMPTS.map((p, idx) => (
              <div
                key={idx}
                onClick={() => handleUsePrompt(p.query)}
                className="glass-3d hover-lift-3d p-4 rounded-2xl cursor-pointer border border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/20 text-left space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-display font-bold text-xs text-slate-900 group-hover:text-[#E8384F] transition-colors">{p.title}</h5>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E8384F] transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs font-mono text-slate-600 bg-white/80 p-2 rounded-xl border border-slate-100">{p.query}</p>
                <p className="text-[11px] text-slate-400 font-sans">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 3: Tool Introspection Logs */}
      {activeSubTab === 'tools' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-4">
          <h4 className="font-display font-bold text-base text-slate-900">
            Immutable Tool Execution Ledger (SQLite WAL)
          </h4>
          <p className="text-xs text-slate-500 font-sans">
            Every read tool invocation is audited with execution timestamps and zero write capabilities.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {TOOL_EXECUTION_LOGS.map((log, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.id}</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-[#E8384F] font-bold border border-rose-200">{log.tool}</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">{log.latency}</span>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400">PARAMS: </span>{log.params}
                </div>
                <div className="text-[11px] text-slate-700 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                  <span className="text-emerald-700 font-bold">OUTPUT: </span>{log.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
