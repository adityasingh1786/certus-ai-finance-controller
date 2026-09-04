import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Database,
  Key,
  Save,
  Check,
  Sliders,
  Building,
  Webhook,
  Lock,
} from 'lucide-react';

const SECTIONS = [
  { id: 'general', label: 'Organization & Legal', icon: Building },
  { id: 'invariants', label: 'Invariant Policy Rules', icon: Sliders },
  { id: 'notifications', label: 'Webhooks & Alerts', icon: Bell },
  { id: 'credentials', label: 'API Keys & Connectors', icon: Key },
  { id: 'security', label: 'Security & Access', icon: Shield },
];

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-9 h-5 rounded-full transition-fast relative flex items-center p-0.5 ${
        on ? 'bg-ink-primary' : 'bg-border-strong'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full bg-white shadow-subtle transition-transform duration-150 ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsScreen() {
  const [activeSection, setActiveSection] = useState('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [orgData, setOrgData] = useState({
    companyName: 'Certus Enterprise Corp India Pvt Ltd',
    gstin: '29AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    fiscalYear: '2026-2027',
    primaryCurrency: 'INR (₹)',
    controllerEmail: 'treasury-controller@certus.ai',
  });

  const [policyData, setPolicyData] = useState({
    rbiWindow: true, // COMP-01
    mdrToleranceBps: '50', // COMP-06
    tdsRatePct: '1.00', // COMP-08
    idempotencyEnforced: true, // COMP-03
    minDisputeFloor: '100', // COMP-04
    doubleLockThreshold: '0.75',
  });

  const [notifData, setNotifData] = useState({
    slackWebhook: 'https://hooks.slack.com/services/T00/B00/XXXX',
    slackEnabled: true,
    emailAlerts: true,
    autoDisputeLetter: true,
    digestDaily: true,
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">
            System Settings & Calibration
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-sans">
            Configure enterprise organization profiles, statutory invariant boundaries, and notification webhooks.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle transition-fast"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Settings Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-surface border border-border-subtle rounded-lg p-1.5 shadow-subtle h-fit space-y-0.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-fast text-left ${
                  isActive
                    ? 'bg-page text-ink-primary font-semibold border border-border-subtle shadow-subtle'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-page'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-ink-primary' : 'text-ink-muted'}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle p-6 space-y-6">
          {/* 1. General Organization */}
          {activeSection === 'general' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-border-subtle">
                <h3 className="font-display font-bold text-sm text-ink-primary">
                  Legal Entity & Financial Profile
                </h3>
                <p className="text-xs text-ink-muted">
                  Corporate parameters used in statutory audit receipts and dispute notices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Legal Entity Name</label>
                  <input
                    type="text"
                    value={orgData.companyName}
                    onChange={(e) => setOrgData({ ...orgData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-page border border-border-subtle rounded-md text-xs text-ink-primary font-sans focus:outline-none focus:border-border-strong"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">GSTIN (India)</label>
                  <input
                    type="text"
                    value={orgData.gstin}
                    onChange={(e) => setOrgData({ ...orgData, gstin: e.target.value })}
                    className="w-full px-3 py-2 bg-page border border-border-subtle rounded-md text-xs text-ink-primary font-mono focus:outline-none focus:border-border-strong"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Corporate PAN</label>
                  <input
                    type="text"
                    value={orgData.pan}
                    onChange={(e) => setOrgData({ ...orgData, pan: e.target.value })}
                    className="w-full px-3 py-2 bg-page border border-border-subtle rounded-md text-xs text-ink-primary font-mono focus:outline-none focus:border-border-strong"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Fiscal Year Calendar</label>
                  <input
                    type="text"
                    value={orgData.fiscalYear}
                    onChange={(e) => setOrgData({ ...orgData, fiscalYear: e.target.value })}
                    className="w-full px-3 py-2 bg-page border border-border-subtle rounded-md text-xs text-ink-primary font-sans focus:outline-none focus:border-border-strong"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Invariant Policies */}
          {activeSection === 'invariants' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-border-subtle">
                <h3 className="font-display font-bold text-sm text-ink-primary">
                  Deterministic Invariant Engine Thresholds
                </h3>
                <p className="text-xs text-ink-muted">
                  Formal boundary checks enforced at Layer 1 before data enters storage.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-md bg-page border border-border-subtle flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">
                      COMP-01: RBI Fair Practices Contact Window (9 AM – 6 PM IST)
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Blocks automated dispute transmission outside permitted statutory banking contact hours.
                    </p>
                  </div>
                  <Toggle
                    on={policyData.rbiWindow}
                    onChange={(v) => setPolicyData({ ...policyData, rbiWindow: v })}
                  />
                </div>

                <div className="p-4 rounded-md bg-page border border-border-subtle flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">
                      COMP-03: Strict Cryptographic Idempotency Keying
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Prevents duplicate journal entries and redundant gateway dispute tickets.
                    </p>
                  </div>
                  <Toggle
                    on={policyData.idempotencyEnforced}
                    onChange={(v) => setPolicyData({ ...policyData, idempotencyEnforced: v })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-secondary">
                      COMP-06: MDR Fee Rate Card Tolerance (bps)
                    </label>
                    <input
                      type="number"
                      value={policyData.mdrToleranceBps}
                      onChange={(e) => setPolicyData({ ...policyData, mdrToleranceBps: e.target.value })}
                      className="w-full px-3 py-2 bg-page border border-border-subtle rounded-md text-xs text-ink-primary font-mono focus:outline-none focus:border-border-strong"
                    />
                    <p className="text-[10px] text-ink-muted">Default: ±50 bps above contracted rate card triggers quarantine.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-secondary">
                      COMP-08: IT Act Section 194-O TDS Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={policyData.tdsRatePct}
                      onChange={(e) => setPolicyData({ ...policyData, tdsRatePct: e.target.value })}
                      className="w-full px-3 py-2 bg-page border border-border-subtle rounded-md text-xs text-ink-primary font-mono focus:outline-none focus:border-border-strong"
                    />
                    <p className="text-[10px] text-ink-muted">Default: 1.00% gross deduction on marketplace e-commerce transactions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-border-subtle">
                <h3 className="font-display font-bold text-sm text-ink-primary">
                  Webhook Endpoints & Incident Alerts
                </h3>
                <p className="text-xs text-ink-muted">
                  Configure notification relays when anomalies are isolated to the Quarantine Hub.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Slack Alert Webhook URL</label>
                  <input
                    type="text"
                    value={notifData.slackWebhook}
                    onChange={(e) => setNotifData({ ...notifData, slackWebhook: e.target.value })}
                    className="w-full px-3 py-2 bg-page border border-border-subtle rounded-md text-xs text-ink-primary font-mono focus:outline-none focus:border-border-strong"
                  />
                </div>

                <div className="p-4 rounded-md bg-page border border-border-subtle flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">Enable Slack Channel Notifications</p>
                    <p className="text-[11px] text-ink-muted">Post structured JSON payloads on fee drift and missing UTRs.</p>
                  </div>
                  <Toggle
                    on={notifData.slackEnabled}
                    onChange={(v) => setNotifData({ ...notifData, slackEnabled: v })}
                  />
                </div>

                <div className="p-4 rounded-md bg-page border border-border-subtle flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">Auto-Draft Razorpay Dispute Demand Notices</p>
                    <p className="text-[11px] text-ink-muted">Automatically generates legal demand letters for fee variances exceeding ₹100.</p>
                  </div>
                  <Toggle
                    on={notifData.autoDisputeLetter}
                    onChange={(v) => setNotifData({ ...notifData, autoDisputeLetter: v })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Credentials */}
          {activeSection === 'credentials' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-border-subtle">
                <h3 className="font-display font-bold text-sm text-ink-primary">
                  Connected API Credentials & Secrets
                </h3>
                <p className="text-xs text-ink-muted">
                  Active connection keys and SFTP certificates for financial rails.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Razorpay Gateway API', keyId: 'rzp_live_88291048201', status: 'ACTIVE', ping: '28ms' },
                  { name: 'HDFC Corporate CMS SFTP', keyId: 'sftp.hdfcbank.com:22 (SSH-ED25519)', status: 'ACTIVE', ping: '62ms' },
                  { name: 'Tally Prime 4.0 Local Mesh', keyId: 'localhost:9000 (XML/ODBC)', status: 'ACTIVE', ping: '12ms' },
                ].map((c, i) => (
                  <div key={i} className="p-3 rounded-md bg-page border border-border-subtle flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-ink-primary">{c.name}</p>
                      <p className="font-mono text-[11px] text-ink-muted mt-0.5">{c.keyId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {c.status}
                      </span>
                      <span className="text-[11px] font-mono text-ink-muted">{c.ping}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Security */}
          {activeSection === 'security' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-border-subtle">
                <h3 className="font-display font-bold text-sm text-ink-primary">
                  Security & Zero-Hallucination Air-Gap
                </h3>
                <p className="text-xs text-ink-muted">
                  Multi-factor authentication and tamper-proof SQLite WAL encryption parameters.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-md bg-page border border-border-subtle space-y-1">
                  <p className="text-xs font-semibold text-ink-primary">Double-Lock Gate Composite Threshold</p>
                  <p className="text-[11px] text-ink-muted">
                    Composite confidence score required before clearing records automatically: <strong className="text-ink-primary font-mono">0.75</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-md bg-page border border-border-subtle space-y-1">
                  <p className="text-xs font-semibold text-ink-primary">Cryptographic Hash Function</p>
                  <p className="text-[11px] text-ink-muted">
                    Immutable state hashing: <strong className="text-ink-primary font-mono">SHA-256 Merkle Tree Proofs</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
