import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 space-y-1">
        <p className="font-medium text-slate-300">
          Built for the Attendance Predictor challenge
        </p>
        <p className="text-[11px] text-slate-400">
          SRM Institute of Science and Technology — Tiruchirappalli
        </p>
      </div>
    </footer>
  );
};
