import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Sliders,
  Check,
  X,
  Lock,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import QuarantineQueue from './QuarantineQueue';

export default function QuarantineHub({
  records = [],
  onRecordResolved,
  onRefresh,
  onInspectRecord,
}) {
  const [activeSubTab, setActiveSubTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  const activeRecords = useMemo(() => {
    return records.filter((r) => !r.is_resolved && !r.resolved);
  }, [records]);

  const resolvedRecords = useMemo(() => {
    return records.filter((r) => r.is_resolved || r.resolved);
  }, [records]);

  const filteredActive = useMemo(() => {
    if (!searchTerm) return activeRecords;
    const term = searchTerm.toLowerCase();
    return activeRecords.filter(
      (r) =>
        r.record_id?.toLowerCase().includes(term) ||
        r.transaction_id?.toLowerCase().includes(term) ||
        r.reason_code?.toLowerCase().includes(term) ||
        r.reason_detail?.toLowerCase().includes(term)
    );
  }, [activeRecords, searchTerm]);

  const tabs = [
    {
      id: 'active',
      label: 'Active Quarantine',
      icon: AlertOctagon,
      badge: activeRecords.length,
    },
    {
      id: 'resolved',
      label: 'Resolution Archive',
      icon: CheckCircle2,
      badge: resolvedRecords.length,
    },
    {
      id: 'rules',
      label: 'Layer 1 Safety Rules',
      icon: ShieldAlert,
      badge: '8 Active',
    },
  ];

  const DETERMINISTIC_RULES = [
    {
      code: 'IMPOSSIBLE_VALUE',
      name: 'Non-Positive Amount Guard',
      desc: 'Isolates transactions where gross or net credit amount is <= 0 or mathematically impossible.',
      enforcedBy: 'Deterministic Rule Gate',
      status: 'Active (Fail-Closed)',
    },
    {
      code: 'INVALID_CURRENCY',
      name: 'ISO Currency Whitelist',
      desc: 'Traps unapproved currencies (e.g. crypto assets) outside INR, USD, EUR, GBP settlement accounts.',
      enforcedBy: 'Deterministic Rule Gate',
      status: 'Active (Fail-Closed)',
    },
    {
      code: 'DUPLICATE_ID',
      name: 'Batch Anti-Duplication',
      desc: 'Detects previously settled payment IDs appearing multiple times across ledger uploads.',
      enforcedBy: 'ACID Constraint Check',
      status: 'Active (Fail-Closed)',
    },
    {
      code: 'NET_GT_GROSS',
      name: 'Net vs Gross Invariant',
      desc: 'Flags transactions where net settlement credit received exceeds the gross customer payment.',
      enforcedBy: 'Deterministic Rule Gate',
      status: 'Active (Fail-Closed)',
    },
    {
      code: 'MISSING_MANDATORY_FIELD',
      name: 'Schema Integrity Guard',
      desc: 'Traps CSV rows missing essential reconciliation columns (timestamp, currency, amount).',
      enforcedBy: 'Dynamic Ingest Validator',
      status: 'Active (Fail-Closed)',
    },
    {
      code: 'FUTURE_TIMESTAMP',
      name: 'Chronology Anomaly Trap',
      desc: 'Isolates records stamped with dates ahead of the current banking settlement clock.',
      enforcedBy: 'Temporal Validator',
      status: 'Active (Fail-Closed)',
    },
    {
      code: 'UTR_CHECKSUM_FAIL',
      name: 'Bank UTR Format Verification',
      desc: 'Validates 16/22-character alpha-numeric structure on NEFT/RTGS bank narrations.',
      enforcedBy: 'Regex & Checksum Filter',
      status: 'Active (Fail-Closed)',
    },
    {
      code: 'UNAUTHORIZED_MDR',
      name: 'MDR Discrepancy Flag',
      desc: 'Flags gateway fee deductions differing by >50 bps from contracted fee schedules.',
      enforcedBy: 'Rate Deviation Engine',
      status: 'Active (Fail-Closed)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Nested Sub-Tab Navigation Bar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        searchTerm={searchTerm}
        onSearchChange={activeSubTab !== 'rules' ? setSearchTerm : null}
        searchPlaceholder="Search quarantine records..."
        actions={
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-page text-ink-secondary hover:text-ink-primary border border-border-subtle text-xs font-semibold transition-fast"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        }
      />

      {/* Sub-View 1: Active Quarantine Queue */}
      {activeSubTab === 'active' && (
        <div className="space-y-6">
          <QuarantineQueue
            records={filteredActive}
            onRecordResolved={onRecordResolved}
            onRefresh={onRefresh}
            onInspectRecord={onInspectRecord}
          />
        </div>
      )}

      {/* Sub-View 2: Resolution Archive */}
      {activeSubTab === 'resolved' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Historical Resolution Archive
                </h3>
                <p className="text-xs text-ink-muted">
                  Audited record of all controller overrides, manual matches, and fee write-offs.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                {resolvedRecords.length} RESOLVED
              </span>
            </div>

            {resolvedRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-muted bg-page rounded-xl border border-border-subtle">
                No resolved quarantine records yet. Resolve anomalies from the Active Quarantine tab to populate this archive.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {resolvedRecords.map((r, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="font-bold text-ink-primary">{r.transaction_id || r.record_id}</span>
                      <p className="text-[11px] text-ink-muted font-sans mt-0.5">{r.reason_detail || r.reason_code}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-semibold font-sans">
                      Resolved by Controller
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-View 3: Layer 1 Safety Rules */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Deterministic Safety Rules (Layer 1 Ingestion Gate)
                </h3>
                <p className="text-xs text-ink-muted">
                  Zero-hallucination safety filters that run prior to AI evaluation. If any rule triggers, the record is immediately quarantined.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                FAIL-CLOSED POLICY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DETERMINISTIC_RULES.map((rule, idx) => (
                <div key={idx} className="p-4 bg-page rounded-xl border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sterling">{rule.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                      {rule.status}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-ink-primary">{rule.name}</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed font-sans">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
