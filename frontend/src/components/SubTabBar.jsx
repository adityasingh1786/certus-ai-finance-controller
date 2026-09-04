import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable Nested Sub-Tab Navigation Bar
 * Clean, minimal sub-tabs with optional search and action slots.
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
    <div className="bg-white border border-slate-200/80 p-1.5 rounded-xl flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
      {/* Tab Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSubTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isActive
                      ? 'bg-white/20 text-white/80'
                      : 'bg-slate-100 border border-slate-200 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Tools: Search & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onSearchChange && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || 'Search records...'}
              className="pl-8 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 text-slate-900 placeholder-slate-400 w-44 sm:w-56 transition-colors"
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
