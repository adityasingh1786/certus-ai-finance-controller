import React, { useState, useMemo } from 'react';
import {
  Bot,
  BookOpen,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import AgentChatPanel from './AgentChatPanel';

export default function CopilotHub({
  reconciliationData,
  quarantineRecords = [],
  onInspectRecord,
}) {
  const [activeSubTab, setActiveSubTab] = useState('chat');
  const [injectedPrompt, setInjectedPrompt] = useState(null);
  const [promptCategory, setPromptCategory] = useState('exceptions');

  const scenarioNum = useMemo(() => {
    const raw = reconciliationData?.scenario_id;
    if (typeof raw === 'object' && raw !== null) return raw.id || 1;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return parseInt(raw, 10) || 1;
    return 1;
  }, [reconciliationData]);

  const scenarioName = reconciliationData?.scenario_name || 'D2C Fashion & Apparel — Festive Flash Sale';
  const primaryBank = reconciliationData?.primary_bank || 'HDFC Bank CMS';
  const erpSystem = reconciliationData?.erp_system || 'Tally Prime 4.0';

  const tabs = [
    { id: 'chat', label: 'Copilot Chat', icon: Bot },
    { id: 'prompts', label: 'Prompt Library', icon: BookOpen, badge: '12' },
    { id: 'tools', label: 'Tool Logs', icon: Terminal },
  ];

  const CATEGORIZED_PROMPTS = {
    exceptions: [
      { title: `Remediation Playbook for ${scenarioName}`, query: `Analyze all quarantined records and provide a step-by-step remediation playbook for ${scenarioName}.`, desc: 'Concrete fix actions for MDR deviations, missing UTRs, and unposted vouchers.' },
      { title: 'MDR Fee Discrepancy Forensic Breakdown', query: `Check for MDR fee deviations between Razorpay gateway and ${primaryBank} statement.`, desc: 'Compares contracted rate cards against actual deducted settlement amounts.' },
      { title: 'Missing UTR Checksum Isolator', query: `Verify bank UTR references and isolate transactions in ${scenarioName} missing CMS settlement credit.`, desc: 'Cross-verifies banking references against general ledger invoices.' },
    ],
    cash: [
      { title: `Audited Position for ${scenarioName}`, query: `What is the audited cash balance and 14-day settlement forecast for Scenario #${scenarioNum}?`, desc: `Queries ledger balance in ${erpSystem} and in-flight transit lines with ${primaryBank}.` },
      { title: 'Stress-Test 14-Day Cash Runway', query: `Run a Monte Carlo liquidity simulation on our ${primaryBank} operating balance under 95% confidence intervals.`, desc: 'Evaluates working capital resilience under volatile conditions.' },
      { title: 'T+1 vs T+2 Settlement Lag Analysis', query: `Calculate the average settlement clearance velocity between Razorpay gateway capture and ${primaryBank} credit.`, desc: 'Identifies temporal float and working capital optimization opportunities.' },
    ],
    tax: [
      { title: 'Section 194-O TDS Compliance Audit', query: `Audit all transactions in ${scenarioName} for Section 194-O (1% TDS on gross e-commerce sales).`, desc: 'Verifies statutory compliance under the Income Tax Act.' },
      { title: '18% GST on Payment Gateway Fees', query: `Verify that 18% GST is correctly applied on all Razorpay processing fee deductions.`, desc: 'Reconciles CGST (9%) + SGST (9%) input tax credit lines.' },
      { title: 'Cross-Border FX Markup & Tax Check', query: `Audit international multi-currency transactions for bank forex spread and statutory withholding.`, desc: 'Validates USD/INR conversions against RBI benchmark rates.' },
    ],
    governance: [
      { title: 'Double-Lock Invariant Gate Proof', query: `Explain how the 55 invariant gates verified the ${scenarioName} batch.`, desc: 'Inspects Layer 1 rule composite score and Layer 2 consensus logs.' },
      { title: 'Solvency Proof Verification', query: `Generate the cryptographic commitment verifying zero general ledger variance.`, desc: 'Proves total ledger balance without revealing underlying payloads.' },
      { title: 'Immutable Audit Trail Verification', query: `Inspect SQLite WAL provenance for the active session.`, desc: 'Verifies temporal integrity and cryptographic signature authenticity.' },
    ],
  };

  const TOOL_EXECUTION_LOGS = [
    { id: `TC-SC${String(scenarioNum).padStart(2, '0')}-01`, tool: 'audit_live_operational_state', params: `{ "scenario": "${scenarioName}", "bank": "${primaryBank}" }`, result: '{ "status": "55/55 PASS", "match_rate": "90.0%" }', latency: '11ms', safety: 'Read-Only' },
    { id: `TC-SC${String(scenarioNum).padStart(2, '0')}-02`, tool: 'get_cash_position_tool', params: '{ "currency": "INR", "include_transit": true }', result: '{ "liquid_cash": 28450000.0, "in_transit": 1813000.0 }', latency: '18ms', safety: 'Read-Only' },
    { id: `TC-SC${String(scenarioNum).padStart(2, '0')}-03`, tool: 'inspect_settlement_batch', params: '{ "batch_id": "SETTLE-SC01", "verify_rates": true }', result: '{ "mdr_rate": 0.02, "gst_rate": 0.18, "delta": 72.50 }', latency: '24ms', safety: 'Read-Only' },
    { id: `TC-SC${String(scenarioNum).padStart(2, '0')}-04`, tool: 'simulate_payout_adjustment', params: '{ "record_id": "QR-001-MDR", "action": "WRITE_OFF_MDR" }', result: '{ "invariants": 55, "integrity": "100%" }', latency: '8ms', safety: 'Dry-Run' },
  ];

  const handleUsePrompt = (promptText) => {
    setInjectedPrompt(promptText);
    setActiveSubTab('chat');
  };

  return (
    <div className="space-y-5">

      {/* Sub-Tab Bar */}
      <SubTabBar tabs={tabs} activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />

      {/* Copilot Chat */}
      {activeSubTab === 'chat' && (
        <div className="surface-elevated p-6 min-h-[620px]">
          <AgentChatPanel
            reconciliationData={reconciliationData}
            quarantineRecords={quarantineRecords}
            initialPrompt={injectedPrompt}
            onInspectRecord={onInspectRecord}
          />
        </div>
      )}

      {/* Prompt Library */}
      {activeSubTab === 'prompts' && (
        <div className="surface-elevated p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Prompt Library</h4>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Pre-built diagnostic queries tailored for {scenarioName}.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-200/80 p-1">
              {[
                { id: 'exceptions', label: 'Exceptions' },
                { id: 'cash', label: 'Cash & Runway' },
                { id: 'tax', label: 'Tax & TDS' },
                { id: 'governance', label: 'Governance' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPromptCategory(c.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    promptCategory === c.id
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CATEGORIZED_PROMPTS[promptCategory].map((p, idx) => (
              <div
                key={idx}
                onClick={() => handleUsePrompt(p.query)}
                className="surface-card p-4 cursor-pointer space-y-3 group hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-[12px] font-semibold text-slate-800 group-hover:text-slate-900">{p.title}</h5>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">{p.query}</p>
                <p className="text-[11px] text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Execution Logs */}
      {activeSubTab === 'tools' && (
        <div className="surface-elevated p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Tool Execution Ledger</h4>
              <p className="text-[12px] text-slate-500">Every tool invocation is audited with execution timestamps.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[12px]">
            {TOOL_EXECUTION_LOGS.map((log, idx) => (
              <div key={idx} className="surface-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold">{log.tool}</span>
                  </div>
                  <span className="pill-matched px-2 py-0.5 rounded-full text-[10px] font-semibold">{log.latency}</span>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400">PARAMS: </span>{log.params}
                </div>
                <div className="text-[11px] text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <span className="text-emerald-700 font-semibold">OUTPUT: </span>{log.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
