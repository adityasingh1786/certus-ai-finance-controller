import React from 'react';
import TreasuryHub from './TreasuryHub';

/**
 * CashPositionScreen — Dedicated Treasury & Cash Runway Screen
 * Wraps TreasuryHub with clean page hierarchy and export options.
 */
export default function CashPositionScreen(props) {
  return (
    <div className="space-y-6">
      <TreasuryHub {...props} />
    </div>
  );
}
