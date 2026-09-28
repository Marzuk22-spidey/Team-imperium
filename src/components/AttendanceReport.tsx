import React from 'react';
import { OverallPrediction, SectionTimetable } from '../types';
import { formatDateWithDay } from '../utils/dateUtils';
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface AttendanceReportProps {
  overall: OverallPrediction;
  selectedSection: SectionTimetable;
  todayDateStr: string;
  planUntilDateStr: string;
  daysRemaining: number;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({
  overall,
  selectedSection,
  todayDateStr,
  planUntilDateStr,
  daysRemaining,
}) => {
  const {
    totalConducted,
    totalAttended,
    overallPercentage,
    totalRemainingClasses,
    subjectsBelow90Count,
    subjectsBelow75Count,
    irreversibleDetentionCount,
    overallStatus,
    predictions,
  } = overall;

  const safeSubjectsCount = predictions.filter(
    (p) => p.conducted > 0 && p.status === 'SAFE'
  ).length;

  const atRiskCount = predictions.filter(
    (p) => p.conducted > 0 && p.status === 'AT_RISK'
  ).length;

  const detentionRecoverableCount = predictions.filter(
    (p) => p.conducted > 0 && p.status === 'DETENTION'
  ).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6 print:bg-white print:text-black print:border-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 print:border-black">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400 print:text-black" />
            <h2 className="text-base font-bold text-white print:text-black">
              Your Attendance Plan & Executive Report
            </h2>
          </div>
          <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
            Generated personalized academic forecast and action priorities based on SRM Institute regulations.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer print:hidden"
        >
          <Printer className="w-3.5 h-3.5 text-indigo-400" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 print:bg-gray-100 print:border-gray-300">
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs border-b border-slate-800 pb-3 mb-3">
          <div>
            <span className="text-slate-400">Class: </span>
            <strong className="text-white print:text-black">{selectedSection.name}</strong> ({selectedSection.year} · {selectedSection.semester})
          </div>
          <div>
            <span className="text-slate-400">Venue: </span>
            <span className="text-slate-200 print:text-black">{selectedSection.venue}</span>
          </div>
          <div className="font-mono tabular-nums">
            <span className="text-slate-400">Assessment Period: </span>
            <strong className="text-indigo-300 print:text-black">{formatDateWithDay(todayDateStr)}</strong> to <strong className="text-indigo-300 print:text-black">{formatDateWithDay(planUntilDateStr)}</strong> ({daysRemaining} days)
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Subjects Already Safe</span>
            <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
              {safeSubjectsCount}
            </span>
            <span className="text-[10px] text-slate-500 block">≥ 90% attendance</span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Subjects Needing Attention</span>
            <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              {atRiskCount}
            </span>
            <span className="text-[10px] text-slate-500 block">75% - 89.9% attendance</span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Subjects in Detention</span>
            <span className="text-xl font-bold text-rose-400 font-mono tabular-nums">
              {detentionRecoverableCount}
            </span>
            <span className="text-[10px] text-slate-500 block">Recovery is possible</span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Irrecoverable Subjects</span>
            <span className={`text-xl font-bold font-mono tabular-nums ${irreversibleDetentionCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {irreversibleDetentionCount}
            </span>
            <span className="text-[10px] text-slate-500 block">Mathematically cannot reach 75%</span>
          </div>
        </div>
      </div>

      {/* Action Plan Table */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Subject Action Priorities
        </h3>

        <div className="space-y-2.5">
          {predictions.map((p) => {
            const {
              subjectId,
              subject,
              conducted,
              attended,
              currentPercentage,
              remainingClasses,
              requiredFor90,
              is90Possible,
              maxClassesMissable90,
              requiredFor75,
              is75Possible,
              maxPossiblePercentage,
              status,
            } = p;

            return (
              <div
                key={subjectId}
                className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white print:text-black">
                      {subject.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      [{subject.code}]
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    Current: <strong className="text-slate-200">{currentPercentage !== null ? `${currentPercentage.toFixed(1)}%` : 'No Data'}</strong> ({attended}/{conducted}) · Remaining: <strong>{remainingClasses} classes</strong> · Max Possible: <strong>{maxPossiblePercentage.toFixed(1)}%</strong>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  {conducted === 0 ? (
                    <span className="text-slate-500 italic">No attendance recorded</span>
                  ) : status === 'SAFE' ? (
                    <div className="text-emerald-400 font-semibold">
                      <span>Attend ≥ {requiredFor90} of {remainingClasses}</span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Safe to miss up to {maxClassesMissable90} {maxClassesMissable90 === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  ) : status === 'AT_RISK' ? (
                    <div className="text-amber-400 font-semibold">
                      {is90Possible ? (
                        <>
                          <span>Attend ≥ {requiredFor90} of {remainingClasses} to reach 90%</span>
                          <span className="text-[11px] text-slate-400 block font-normal">
                            Currently at risk (≥75%)
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Max possible is {maxPossiblePercentage.toFixed(1)}%</span>
                          <span className="text-[11px] text-amber-500/80 block font-normal">
                            90% cannot be reached
                          </span>
                        </>
                      )}
                    </div>
                  ) : status === 'DETENTION' ? (
                    <div className="text-rose-400 font-bold">
                      <span>Recovery Plan: Attend {requiredFor75} of {remainingClasses}</span>
                      <span className="text-[11px] text-rose-300 block font-normal">
                        Reaches exactly 75.0% threshold
                      </span>
                    </div>
                  ) : (
                    <div className="text-red-400 font-black">
                      <span>IRREVERSIBLE DETENTION</span>
                      <span className="text-[11px] text-red-300 block font-normal">
                        Max possible is only {maxPossiblePercentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
