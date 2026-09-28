import React from 'react';
import { AlertOctagon, AlertTriangle } from 'lucide-react';
import { SubjectPrediction } from '../types';

interface IrreversibleDetentionBannerProps {
  irreversibleSubjects: SubjectPrediction[];
  overallIrreversible: boolean;
  overallAttendance: number | null;
  overallMaxPossible: number | null;
  totalRemainingClasses: number;
}

export const IrreversibleDetentionBanner: React.FC<IrreversibleDetentionBannerProps> = ({
  irreversibleSubjects,
  overallIrreversible,
  overallAttendance,
  overallMaxPossible,
  totalRemainingClasses,
}) => {
  if (irreversibleSubjects.length === 0 && !overallIrreversible) {
    return null;
  }

  return (
    <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-5 mb-6 shadow-xl shadow-red-950/50 relative overflow-hidden animate-pulse">
      {/* Background Accent glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-red-600 text-white rounded-lg shrink-0 shadow-md">
            <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-black text-red-300">
                Critical Mandatory Warning
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              IRREVERSIBLE DETENTION
            </h2>
            <p className="text-red-200 text-sm mt-1 max-w-2xl leading-relaxed">
              Even if you attend <strong>every remaining scheduled class</strong>, your attendance cannot recover to the mandatory <strong>75%</strong> threshold by the selected date.
            </p>
          </div>
        </div>

        {overallIrreversible && overallAttendance !== null && (
          <div className="bg-red-900/60 border border-red-500/60 rounded-lg p-3 text-right self-stretch md:self-center font-mono tabular-nums">
            <div className="text-[11px] text-red-300 uppercase tracking-wider font-sans font-semibold">
              Overall Status
            </div>
            <div className="text-xl font-bold text-white">
              {overallAttendance.toFixed(1)}%
            </div>
            <div className="text-xs text-red-300">
              Max possible: <span className="font-bold text-white">{overallMaxPossible?.toFixed(1) ?? '—'}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Subject-specific breakdown for irreversible subjects */}
      <div className="mt-4 pt-4 border-t border-red-800/80">
        <div className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Affected Subjects with Irreversible Detention ({irreversibleSubjects.length})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {irreversibleSubjects.map((sub) => (
            <div
              key={sub.subjectId}
              className="bg-black/40 border border-red-500/40 rounded-lg p-3 text-xs"
            >
              <div className="flex items-center justify-between font-semibold text-white">
                <span className="truncate pr-2">{sub.subject.name}</span>
                <span className="text-red-400 shrink-0 font-mono">[{sub.subject.code}]</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 font-mono tabular-nums text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Current</span>
                  <span className="text-red-400 font-bold">{sub.currentPercentage?.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Max Possible</span>
                  <span className="text-amber-400 font-bold">{sub.maxPossiblePercentage.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Remaining</span>
                  <span className="text-slate-100 font-bold">{sub.remainingClasses} classes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
