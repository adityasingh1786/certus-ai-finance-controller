import React from 'react';
import CopilotHub from './CopilotHub';

/**
 * CopilotScreen — Full-Page Autonomous Copilot Studio
 * Provides dedicated financial analyst chat with citation inspection.
 */
export default function CopilotScreen(props) {
  return (
    <div className="h-[calc(100vh-120px)]">
      <CopilotHub {...props} />
    </div>
  );
}
