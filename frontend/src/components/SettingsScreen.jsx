import React, { useState } from "react";
import { User, Shield, Bell, Database, Key, ChevronRight, Save } from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "api", label: "API Keys", icon: Key },
];

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className="w-10 h-6 rounded-full transition-colors duration-200 relative flex items-center"
      style={{ background: on ? "#E8384F" : "#E5E7EB" }}>
      <span className="w-4 h-4 rounded-full bg-white shadow-sm absolute transition-transform duration-200"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
    </button>
  );
}

export default function SettingsScreen() {
  const [activeSection, setActiveSection] = useState("profile");
  const [notifications, setNotifications] = useState({ email: true, slack: false, exceptions: true, digest: true });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Settings</h1>
        <p className="text-sm text-ink-muted mt-1 font-sans">Manage your account, security, and application preferences.</p>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        {/* Section Nav */}
        <div className="bg-surface border border-border-subtle rounded-xl p-2 shadow-card h-fit">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? "rgba(232,56,79,0.06)" : "transparent",
                  color: isActive ? "#E8384F" : "#4B5563",
                  borderLeft: isActive ? "2px solid #E8384F" : "2px solid transparent",
                  paddingLeft: isActive ? "10px" : "12px",
                }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? "#E8384F" : "#9CA3AF" }} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
          {activeSection === "profile" && (
            <div>
              <div className="px-6 py-4 border-b border-border-subtle">
                <h2 className="font-display font-semibold text-base text-ink-primary">Profile Settings</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-5 pb-5 border-b border-border-subtle">
                  <div className="w-16 h-16 rounded-full bg-sterling flex items-center justify-center text-white font-display font-bold text-2xl">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-ink-primary">Admin User</p>
                    <p className="text-sm text-ink-muted font-sans">admin@certus.ai</p>
                    <button className="mt-1.5 text-xs font-semibold" style={{ color: "#E8384F" }}>Change Photo</button>
                  </div>
                </div>
                {[["Full Name", "Admin User"], ["Email", "admin@certus.ai"], ["Organization", "Certus AI"], ["Role", "Super Admin"]].map(([label, val]) => (
                  <div key={label}>
                    <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">{label}</label>
                    <input type="text" defaultValue={val}
                      className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-sm font-sans text-ink-primary outline-none focus:border-border-strong transition-colors"
                    />
                  </div>
                ))}
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg,#E8384F,#D02B41)", boxShadow: "0 2px 8px rgba(232,56,79,0.30)" }}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <div className="px-6 py-4 border-b border-border-subtle">
                <h2 className="font-display font-semibold text-base text-ink-primary">Notification Preferences</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { id: "email", label: "Email Alerts", desc: "Get notified of critical exceptions via email" },
                  { id: "slack", label: "Slack Integration", desc: "Send notifications to your Slack workspace" },
                  { id: "exceptions", label: "Exception Alerts", desc: "Immediate alerts for new mismatches or missing records" },
                  { id: "digest", label: "Daily Digest", desc: "Summary of reconciliation activity every morning" },
                ].map((n) => (
                  <div key={n.id} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                    <div>
                      <p className="font-medium text-sm text-ink-primary">{n.label}</p>
                      <p className="text-xs text-ink-muted font-sans mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle on={notifications[n.id]} onChange={(v) => setNotifications((prev) => ({ ...prev, [n.id]: v }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeSection === "security" || activeSection === "data" || activeSection === "api") && (
            <div className="flex flex-col items-center justify-center py-20 text-ink-muted">
              <Shield className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
