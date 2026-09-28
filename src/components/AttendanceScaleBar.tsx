import React from 'react';
import { AttendanceStatus } from '../types';

interface AttendanceScaleBarProps {
  percentage: number | null;
  status: AttendanceStatus;
}

export const AttendanceScaleBar: React.FC<AttendanceScaleBarProps> = ({
  percentage,
  status,
}) => {
  const current = percentage !== null ? Math.min(100, Math.max(0, percentage)) : 0;

  // Determine indicator color
  let pointerColor = 'bg-slate-400 border-slate-200';
  let badgeText = 'No Data';

  if (percentage !== null) {
    if (percentage >= 90) {
      pointerColor = 'bg-emerald-400 border-emerald-200 text-emerald-950 shadow-emerald-500/50';
      badgeText = 'SAFE (≥90%)';
    } else if (percentage >= 75) {
      pointerColor = 'bg-amber-400 border-amber-200 text-amber-950 shadow-amber-500/50';
      badgeText = 'AT RISK (75% - 89.9%)';
    } else if (status === 'IRREVERSIBLE_DETENTION') {
      pointerColor = 'bg-red-600 border-red-300 text-white shadow-red-600/50 animate-pulse';
      badgeText = 'IRREVERSIBLE DETENTION';
    } else {
      pointerColor = 'bg-rose-500 border-rose-200 text-white shadow-rose-500/50';
      badgeText = 'DETENTION ZONE (<75%)';
    }
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Attendance Spectrum & Regulation Thresholds
          </h3>
          <p className="text-xs text-slate-400">
            Mandatory SRM Regulations: Minimum 75% to sit for end-semester exams, 90% target for safe academic standing.
          </p>
        </div>
        <div className="text-xs font-semibold">
          <span className="text-slate-400">Current Standing: </span>
          <span className="text-slate-200 font-mono tabular-nums">
            {percentage !== null ? `${percentage.toFixed(1)}%` : 'No Record'}
          </span>
          <span className="mx-1.5 text-slate-600">·</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              status === 'SAFE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : status === 'AT_RISK'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : status === 'DETENTION'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-red-500/30 text-red-300 border border-red-500'
            }`}
          >
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* The Visual Bar Container */}
      <div className="relative pt-7 pb-4">
        {/* Scale track with 3 segmented zones: 0-75% (Detention), 75-90% (At Risk), 90-100% (Safe) */}
        <div className="h-4 w-full rounded-full bg-slate-800 flex overflow-hidden shadow-inner">
          {/* Zone 1: Detention Zone (0% to 75%) -> 75% width */}
          <div
            className="h-full bg-gradient-to-r from-red-600 to-rose-600 opacity-90 transition-all"
            style={{ width: '75%' }}
            title="Detention Zone (Below 75%)"
          />

          {/* Zone 2: At Risk Zone (75% to 90%) -> 15% width */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 opacity-90 transition-all"
            style={{ width: '15%' }}
            title="At Risk Zone (75% - 89.9%)"
          />

          {/* Zone 3: Safe Zone (90% to 100%) -> 10% width */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-90 transition-all"
            style={{ width: '10%' }}
            title="Safe Target Zone (90% - 100%)"
          />
        </div>

        {/* 75% Threshold Marker Line */}
        <div
          className="absolute top-4 bottom-2 w-0.5 bg-white shadow-md z-10"
          style={{ left: '75%' }}
        >
          <div className="absolute -top-7 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-rose-300 bg-slate-950 px-1.5 py-0.5 rounded border border-rose-500/40">
            75% Detention
          </div>
        </div>

        {/* 90% Threshold Marker Line */}
        <div
          className="absolute top-4 bottom-2 w-0.5 bg-white shadow-md z-10"
          style={{ left: '90%' }}
        >
          <div className="absolute -top-7 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-500/40">
            90% Safe Target
          </div>
        </div>

        {/* Student's Current Position Needle */}
        {percentage !== null && (
          <div
            className="absolute top-3 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300 z-20"
            style={{ left: `${current}%` }}
          >
            {/* Top Indicator Callout */}
            <div
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border shadow-lg whitespace-nowrap font-mono tabular-nums ${pointerColor}`}
            >
              {current.toFixed(1)}%
            </div>
            {/* Pin arrow */}
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white -mt-0.5" />
            {/* Needle Line */}
            <div className="w-1 bg-white h-5 rounded-full shadow-md mt-0.5" />
          </div>
        )}
      </div>

      {/* Axis Scale Labels */}
      <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
        <span>0%</span>
        <span className="text-slate-500">25%</span>
        <span className="text-slate-500">50%</span>
        <span className="text-rose-400 font-bold">75% (Detention Bar)</span>
        <span className="text-emerald-400 font-bold">90% (Safe Target)</span>
        <span>100%</span>
      </div>
    </div>
  );
};
