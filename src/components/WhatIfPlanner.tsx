import React, { useState, useEffect } from 'react';
import { SubjectPrediction } from '../types';
import { simulateAttendance } from '../utils/calculationEngine';
import {
  Sliders,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface WhatIfPlannerProps {
  predictions: SubjectPrediction[];
}

export const WhatIfPlanner: React.FC<WhatIfPlannerProps> = ({ predictions }) => {
  // Store chosen future attendance for each subject: Record<subjectId, number>
  const [plannedAttendance, setPlannedAttendance] = useState<Record<string, number>>({});

  // Initialize planner with current required for 90% or max
  useEffect(() => {
    const initial: Record<string, number> = {};
    predictions.forEach((p) => {
      // Default to either requiredFor90, or all remaining, or existing
      if (plannedAttendance[p.subjectId] !== undefined) {
        initial[p.subjectId] = Math.min(
          p.remainingClasses,
          plannedAttendance[p.subjectId]
        );
      } else {
        initial[p.subjectId] = p.remainingClasses;
      }
    });
    setPlannedAttendance(initial);
  }, [predictions]);

  const handleSliderChange = (subjectId: string, val: number) => {
    setPlannedAttendance((prev) => ({
      ...prev,
      [subjectId]: val,
    }));
  };

  const handleSetAll100 = () => {
    const updated: Record<string, number> = {};
    predictions.forEach((p) => {
      updated[p.subjectId] = p.remainingClasses;
    });
    setPlannedAttendance(updated);
  };

  const handleSetMin90 = () => {
    const updated: Record<string, number> = {};
    predictions.forEach((p) => {
      if (p.is90Possible && p.requiredFor90 !== null) {
        updated[p.subjectId] = p.requiredFor90;
      } else {
        updated[p.subjectId] = p.remainingClasses;
      }
    });
    setPlannedAttendance(updated);
  };

  const handleSetMin75 = () => {
    const updated: Record<string, number> = {};
    predictions.forEach((p) => {
      if (p.is75Possible && p.requiredFor75 !== null) {
        updated[p.subjectId] = p.requiredFor75;
      } else {
        updated[p.subjectId] = p.remainingClasses;
      }
    });
    setPlannedAttendance(updated);
  };

  // Calculate overall projected attendance based on user's What-If selections
  let totalProjectedConducted = 0;
  let totalProjectedAttended = 0;

  predictions.forEach((p) => {
    const planned = plannedAttendance[p.subjectId] ?? p.remainingClasses;
    totalProjectedConducted += p.conducted + p.remainingClasses;
    totalProjectedAttended += p.attended + planned;
  });

  const overallProjected =
    totalProjectedConducted > 0
      ? (totalProjectedAttended / totalProjectedConducted) * 100
      : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
      {/* Top Banner and Quick Scenario presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              "What-If?" Interactive Attendance Planner
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test custom attendance scenarios. Adjust how many upcoming classes you plan to attend or miss to see projected final percentages.
          </p>
        </div>

        {/* Global Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Set All:</span>
          <button
            onClick={handleSetAll100}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 font-medium"
          >
            Attend 100%
          </button>
          <button
            onClick={handleSetMin90}
            className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/80 font-medium"
          >
            Target 90%
          </button>
          <button
            onClick={handleSetMin75}
            className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-950/80 font-medium"
          >
            Target 75% (Escape Detention)
          </button>
        </div>
      </div>

      {/* Overall Projected Summary Pill */}
      {overallProjected !== null && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 block">Projected Overall Standing:</span>
            <div className="flex items-baseline gap-2 font-mono tabular-nums">
              <span className="text-2xl font-black text-white">
                {overallProjected.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">
                ({totalProjectedAttended} of {totalProjectedConducted} classes)
              </span>
            </div>
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold border ${
                overallProjected >= 90
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : overallProjected >= 75
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
              }`}
            >
              {overallProjected >= 90
                ? 'PROJECTED SAFE (≥90%)'
                : overallProjected >= 75
                ? 'PROJECTED AT RISK (75% - 89.9%)'
                : 'PROJECTED DETENTION ZONE (<75%)'}
            </span>
          </div>
        </div>
      )}

      {/* Subject Interactive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {predictions.map((p) => {
          const {
            subjectId,
            subject,
            conducted,
            attended,
            currentPercentage,
            remainingClasses,
            is75Possible,
            is90Possible,
          } = p;

          const toAttend = plannedAttendance[subjectId] ?? remainingClasses;
          const { projectedPercentage, classesMissed, status } = simulateAttendance(
            conducted,
            attended,
            remainingClasses,
            toAttend
          );

          let statusBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
          if (status === 'SAFE') {
            statusBadgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
          } else if (status === 'AT_RISK') {
            statusBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
          } else {
            statusBadgeClass = 'bg-rose-950/80 text-rose-300 border-rose-500/50';
          }

          const isDetentionWarning = projectedPercentage < 75;

          return (
            <div
              key={subjectId}
              className={`bg-slate-950/60 border rounded-xl p-4 transition-all ${
                isDetentionWarning
                  ? 'border-rose-500/70 shadow-sm shadow-rose-950/40'
                  : 'border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold">
                    {subject.code}
                  </div>
                  <h3 className="text-xs font-bold text-slate-100 mt-0.5 truncate" title={subject.name}>
                    {subject.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${statusBadgeClass}`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Status Comparison: Current vs Projected */}
              <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg text-xs font-mono tabular-nums">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Current</span>
                  <span className="text-slate-200 font-semibold">
                    {currentPercentage !== null ? `${currentPercentage.toFixed(1)}%` : 'No Record'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">
                    ({attended}/{conducted})
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-sans">Projected Attendance</span>
                  <span
                    className={`text-base font-extrabold ${
                      projectedPercentage >= 90
                        ? 'text-emerald-400'
                        : projectedPercentage >= 75
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {projectedPercentage.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">
                    ({attended + toAttend}/{conducted + remainingClasses})
                  </span>
                </div>
              </div>

              {/* Slider Control */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">
                    Classes to Attend: <span className="font-mono text-indigo-400 text-sm font-bold">{toAttend}</span> / {remainingClasses}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Missed: <span className="text-amber-400 font-bold">{classesMissed}</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={remainingClasses}
                  value={toAttend}
                  onChange={(e) =>
                    handleSliderChange(subjectId, parseInt(e.target.value, 10))
                  }
                  disabled={remainingClasses === 0}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 (Attend none)</span>
                  <span>{Math.floor(remainingClasses / 2)}</span>
                  <span>{remainingClasses} (Attend all)</span>
                </div>
              </div>

              {/* Warning if falls below 75% */}
              {isDetentionWarning && (
                <div className="mt-3 p-2 bg-rose-950/80 border border-rose-500/60 rounded-md text-[11px] text-rose-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Warning:</strong> Missing {classesMissed} classes drops your projected attendance to {projectedPercentage.toFixed(1)}%, falling into the mandatory detention zone (&lt;75%).
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
