import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable Nested Sub-Tab Navigation Bar
 * Renders sleek sub-tabs, inline search input, and action triggers
 * adhering to the Sterling Red (#E8384F) & White/Off-White design system.
 */
export default function SubTabBar({
  tabs = [],
  activeSubTab,
  onSubTabChange,
  actions,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
}) {
  return (
    <div className="bg-surface border border-border-subtle p-2 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-card sticky top-0 z-10">
      {/* Tab Buttons with Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSubTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-fast font-display ${
                isActive
                  ? 'bg-sterling text-white shadow-subtle'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-page'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-page border border-border-subtle text-ink-muted'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Tools: Search & Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {onSearchChange && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || 'Search records...'}
              className="pl-8 pr-3 py-1 text-xs font-mono bg-page border border-border-subtle rounded-lg outline-none focus:border-border-strong text-ink-primary placeholder-ink-muted w-44 sm:w-56 transition-fast"
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
