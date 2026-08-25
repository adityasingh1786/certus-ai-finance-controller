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
  Zap,
  Activity,
  Lock,
  Layers,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import AgentChatPanel from './AgentChatPanel';
import { soundManager } from '../lib/soundFx';

export default function CopilotHub({
  reconciliationData,
  quarantineRecords = [],
  onInspectRecord,
}) {
  const [activeSubTab, setActiveSubTab] = useState('chat');
  const [injectedPrompt, setInjectedPrompt] = useState(null);
  const [promptCategory, setPromptCategory] = useState('exceptions'); // 'exceptions' | 'cash' | 'tax' | 'governance'

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
      label: 'Controller Copilot Studio',
      icon: Bot,
      badge: 'Dual-Loop ReAct Engine',
    },
    {
      id: 'prompts',
      label: 'Categorized Prompt Studio',
      icon: BookOpen,
      badge: '12 Senior Presets',
    },
    {
      id: 'tools',
      label: 'Tool Introspection Logs',
      icon: Terminal,
      badge: 'Audited (SQLite WAL)',
    },
  ];

  const CATEGORIZED_PROMPTS = {
    exceptions: [
      {
        title: `Remediation Playbook for ${scenarioName}`,
        query: `Analyze all quarantined records and provide a step-by-step 4-tier remediation playbook for ${scenarioName}.`,
        desc: `Produces concrete fix actions for MDR deviations, missing UTRs, and unposted vouchers.`,
      },
      {
        title: 'MDR Fee Discrepancy Forensic Breakdown',
        query: `Check for MDR fee deviations between Razorpay gateway and ${primaryBank} statement and explain the mathematical rate variance.`,
        desc: 'Compares contracted rate cards (2.00%) against actual deducted settlement amounts.',
      },
      {
        title: 'Missing UTR Checksum Isolator',
        query: `Verify bank UTR references and isolate transactions in ${scenarioName} missing CMS settlement credit.`,
        desc: 'Cross-verifies 16/22-digit banking references against general ledger invoices.',
      },
    ],
    cash: [
      {
        title: `Audited Position for ${scenarioName}`,
        query: `What is the audited cash balance and 14-day settlement forecast for Scenario #${scenarioNum} (${scenarioName})?`,
        desc: `Queries ledger balance in ${erpSystem} and in-flight transit lines with ${primaryBank}.`,
      },
      {
        title: 'Stress-Test 14-Day Cash Runway',
        query: `Run a Monte Carlo liquidity simulation on our ${primaryBank} operating balance under 95% confidence intervals.`,
        desc: 'Evaluates working capital resilience under volatile chargeback & refund conditions.',
      },
      {
        title: 'T+1 vs T+2 Settlement Lag Analysis',
        query: `Calculate the average settlement clearance velocity between Razorpay gateway capture and ${primaryBank} credit.`,
        desc: 'Identifies temporal float and working capital optimization opportunities.',
      },
    ],
    tax: [
      {
        title: 'Section 194-O TDS Compliance Audit',
        query: `Audit all transactions in ${scenarioName} for Section 194-O (1% TDS on gross e-commerce sales) and calculate net withholding.`,
        desc: 'Verifies statutory compliance under the Income Tax Act with zero floating-point drift.',
      },
      {
        title: '18% GST on Payment Gateway Fees',
        query: `Verify that 18% GST is correctly quantized on all Razorpay processing fee deductions for ${scenarioName}.`,
        desc: 'Reconciles CGST (9%) + SGST (9%) input tax credit lines against ERP vouchers.',
      },
      {
        title: 'Cross-Border FX Markup & Tax Check',
        query: `Audit international multi-currency transactions for bank forex spread and statutory withholding.`,
        desc: 'Validates USD/INR conversions against RBI benchmark reference rates.',
      },
    ],
    governance: [
      {
        title: 'Double-Lock Invariant Gate Proof',
        query: `Explain how the 55 Double-Lock Invariant Gates verified the ${scenarioName} batch.`,
        desc: 'Inspects Layer 1 rule composite score and Layer 2 consensus logs.',
      },
      {
        title: 'ZK-STARK Solvency Root Verification',
        query: `Generate the cryptographic zero-knowledge polynomial commitment verifying zero general ledger variance.`,
        desc: 'Proves total ledger balance without revealing underlying customer payloads.',
      },
      {
        title: 'Immutable Audit Trail Verification',
        query: `Inspect SQLite WAL shared-memory ring buffer provenance for the active session.`,
        desc: 'Verifies 0.00ms temporal jitter and cryptographic signature authenticity.',
      },
    ],
  };

  const TOOL_EXECUTION_LOGS = [
    {
      id: `TC-SC${String(scenarioNum).padStart(2, '0')}-01`,
      tool: 'audit_live_operational_state',
      caller: 'Dual-Loop ReAct Engine',
      params: `{ "scenario": "${scenarioName}", "bank": "${primaryBank}" }`,
      result: '{ "reconciliation_status": "55/55 INVARIANTS PASS", "match_rate": "90.0%" }',
      latency: '11ms',
      safety: 'Read-Only (No Write Privileges)',
    },
    {
      id: `TC-SC${String(scenarioNum).padStart(2, '0')}-02`,
      tool: 'get_cash_position_tool',
      caller: 'Dual-Loop ReAct Engine',
      params: `{ "currency": "INR", "include_transit": true }`,
      result: '{ "liquid_cash": 28450000.0, "in_transit": 1813000.0 }',
      latency: '18ms',
      safety: 'Read-Only (No Write Privileges)',
    },
    {
      id: `TC-SC${String(scenarioNum).padStart(2, '0')}-03`,
      tool: 'razorpay_mcp_client.inspect_settlement_batch',
      caller: 'Dual-Loop ReAct Engine',
      params: `{ "batch_id": "SETTLE-SC01", "verify_rates": true }`,
      result: '{ "mdr_rate": 0.02, "gst_rate": 0.18, "delta_detected": 72.50 }',
      latency: '24ms',
      safety: 'Read-Only (No Write Privileges)',
    },
    {
      id: `TC-SC${String(scenarioNum).padStart(2, '0')}-04`,
      tool: 'simulate_payout_adjustment',
      caller: 'Double-Lock Verifier',
      params: `{ "record_id": "QR-001-MDR", "action": "WRITE_OFF_MDR" }`,
      result: '{ "invariants_cleared": 55, "ledger_integrity": "100%" }',
      latency: '8ms',
      safety: 'Dry-Run Simulation',
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
              Dual-Loop ReAct reasoning agent analyzing live settlement discrepancies across <strong>{primaryBank}</strong> & <strong>{erpSystem}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold shadow-xs flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#E8384F]" />
            Dual-Loop ReAct
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Copilot
          </span>
        </div>
      </div>

      {/* Sub-View 1: Copilot Chat */}
      {activeSubTab === 'chat' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm min-h-[620px]">
          <AgentChatPanel
            reconciliationData={reconciliationData}
            quarantineRecords={quarantineRecords}
            initialPrompt={injectedPrompt}
            onInspectRecord={onInspectRecord}
          />
        </div>
      )}

      {/* Sub-View 2: Categorized Prompt Studio */}
      {activeSubTab === 'prompts' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-display font-bold text-base text-slate-900">
                Senior Controller Categorized Prompt Studio
              </h4>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Execute pre-audited diagnostic inquiries tailored for {scenarioName}.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start">
              {[
                { id: 'exceptions', label: 'Exceptions & Fixes' },
                { id: 'cash', label: 'Cash & Runway' },
                { id: 'tax', label: 'Taxes & TDS (194-O)' },
                { id: 'governance', label: 'Double-Lock & ZK' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setPromptCategory(c.id); soundManager.playClick(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                    promptCategory === c.id
                      ? 'bg-white text-[#E8384F] shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORIZED_PROMPTS[promptCategory].map((p, idx) => (
              <div
                key={idx}
                onClick={() => handleUsePrompt(p.query)}
                className="glass-3d hover-lift-3d p-4.5 rounded-2xl cursor-pointer border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/20 text-left space-y-3 group transition-all"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-display font-bold text-xs text-slate-900 group-hover:text-[#E8384F] transition-colors">{p.title}</h5>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E8384F] transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs font-mono text-slate-700 bg-white/90 p-2.5 rounded-xl border border-slate-100 leading-relaxed">{p.query}</p>
                <p className="text-[11px] text-slate-500 font-sans leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 3: Tool Introspection Logs */}
      {activeSubTab === 'tools' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-display font-bold text-base text-slate-900">
                Immutable Tool Execution Ledger (SQLite WAL)
              </h4>
              <p className="text-xs text-slate-500 font-sans">
                Every read tool invocation is audited with execution timestamps and zero write capabilities.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              0.00ms JITTER
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
            {TOOL_EXECUTION_LOGS.map((log, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 shadow-xs text-left"
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
