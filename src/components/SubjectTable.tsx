import React from 'react';
import { SubjectPrediction } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface SubjectTableProps {
  predictions: SubjectPrediction[];
}

export const SubjectTable: React.FC<SubjectTableProps> = ({ predictions }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white">Subject-by-Subject Forecast</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual target attendance analysis based on actual timetable calendar occurrences.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Safe (≥90%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>At Risk (75-89%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Detention (&lt;75%)</span>
          </span>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-3 text-right">Current</th>
              <th className="py-3 px-3 text-right">Remaining</th>
              <th className="py-3 px-3 text-right">Need for 90%</th>
              <th className="py-3 px-3 text-right">Need for 75%</th>
              <th className="py-3 px-3 text-right">Max Possible</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
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

              let statusBadgeClass =
                'bg-slate-800 text-slate-300 border-slate-700';
              let statusIcon = null;

              if (conducted === 0) {
                statusBadgeClass =
                  'bg-slate-800 text-slate-400 border-slate-700';
              } else if (status === 'SAFE') {
                statusBadgeClass =
                  'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
                statusIcon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />;
              } else if (status === 'AT_RISK') {
                statusBadgeClass =
                  'bg-amber-950/60 text-amber-400 border-amber-500/40';
                statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline mr-1" />;
              } else if (status === 'DETENTION') {
                statusBadgeClass =
                  'bg-rose-950/70 text-rose-400 border-rose-500/40';
                statusIcon = <AlertOctagon className="w-3.5 h-3.5 text-rose-400 inline mr-1" />;
              } else if (status === 'IRREVERSIBLE_DETENTION') {
                statusBadgeClass =
                  'bg-red-950 text-red-300 border-red-500 font-black animate-pulse';
                statusIcon = <AlertOctagon className="w-3.5 h-3.5 text-red-400 inline mr-1" />;
              }

              return (
                <tr
                  key={subjectId}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {/* Subject Name and Code */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{subject.name}</span>
                      {subject.isLab && (
                        <span className="text-[10px] text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30">
                          Lab
                        </span>
                      )}
                      {subject.isProject && (
                        <span className="text-[10px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                          Project
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>{subject.code}</span>
                      <span>·</span>
                      <span>
                        {attended} of {conducted} attended
                      </span>
                    </div>

                    {/* Helpful Action Tip */}
                    <div className="mt-1 text-[11px]">
                      {conducted === 0 ? (
                        <span className="text-slate-500 italic">No attendance recorded</span>
                      ) : status === 'SAFE' ? (
                        <span className="text-emerald-400/90">
                          Attend ≥ {requiredFor90} of {remainingClasses} remaining · You can miss up to {maxClassesMissable90} {maxClassesMissable90 === 1 ? 'class' : 'classes'}
                        </span>
                      ) : status === 'AT_RISK' ? (
                        is90Possible ? (
                          <span className="text-amber-400/90">
                            Attend ≥ {requiredFor90} of {remainingClasses} to reach 90%
                          </span>
                        ) : (
                          <span className="text-amber-400/90">
                            90% cannot be reached · Max possible is {maxPossiblePercentage.toFixed(1)}%
                          </span>
                        )
                      ) : status === 'DETENTION' ? (
                        <span className="text-rose-400 font-semibold">
                          Recovery Possible: Must attend ≥ {requiredFor75} of {remainingClasses} to reach 75%
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold">
                          IRREVERSIBLE DETENTION: Even with 100% attendance, max is {maxPossiblePercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Current % */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {currentPercentage !== null ? (
                      <span
                        className={`text-sm font-bold ${
                          currentPercentage >= 90
                            ? 'text-emerald-400'
                            : currentPercentage >= 75
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {currentPercentage.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Remaining classes */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300 font-medium">
                    {remainingClasses}
                  </td>

                  {/* Need for 90% */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {is90Possible && requiredFor90 !== null ? (
                      <span className="text-slate-200">
                        <strong className="text-indigo-400">{requiredFor90}</strong> / {remainingClasses}
                      </span>
                    ) : (
                      <span className="text-rose-400 text-[11px] font-sans font-semibold">
                        Cannot reach
                      </span>
                    )}
                  </td>

                  {/* Need for 75% */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {is75Possible && requiredFor75 !== null ? (
                      <span className="text-slate-200">
                        <strong className={currentPercentage !== null && currentPercentage < 75 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                          {requiredFor75}
                        </strong> / {remainingClasses}
                      </span>
                    ) : (
                      <span className="text-red-400 text-[11px] font-sans font-black">
                        Impossible
                      </span>
                    )}
                  </td>

                  {/* Max Possible % */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300 font-semibold">
                    {maxPossiblePercentage.toFixed(1)}%
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold border ${statusBadgeClass}`}
                    >
                      {statusIcon}
                      <span>
                        {conducted === 0
                          ? 'No Record'
                          : status === 'IRREVERSIBLE_DETENTION'
                          ? 'IRREVERSIBLE'
                          : status.replace('_', ' ')}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Section 15: Responsive) */}
      <div className="md:hidden divide-y divide-slate-800">
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

          let cardBorder = 'border-slate-800';
          let statusBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';

          if (conducted === 0) {
            statusBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
          } else if (status === 'SAFE') {
            statusBadgeClass = 'bg-emerald-950 text-emerald-400 border-emerald-500/40';
          } else if (status === 'AT_RISK') {
            statusBadgeClass = 'bg-amber-950 text-amber-400 border-amber-500/40';
          } else if (status === 'DETENTION') {
            statusBadgeClass = 'bg-rose-950 text-rose-400 border-rose-500/40';
            cardBorder = 'border-rose-900/50';
          } else if (status === 'IRREVERSIBLE_DETENTION') {
            statusBadgeClass = 'bg-red-950 text-red-300 border-red-500 font-bold';
            cardBorder = 'border-red-600';
          }

          return (
            <div key={subjectId} className={`p-4 ${cardBorder}`}>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold">
                    {subject.code}
                  </div>
                  <h3 className="text-xs font-bold text-slate-100 mt-0.5">
                    {subject.name}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${statusBadgeClass}`}
                >
                  {conducted === 0
                    ? 'No Record'
                    : status === 'IRREVERSIBLE_DETENTION'
                    ? 'IRREVERSIBLE'
                    : status.replace('_', ' ')}
                </span>
              </div>

              {/* Attendance metrics grid */}
              <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg font-mono tabular-nums text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Current</span>
                  <span
                    className={`font-bold text-sm ${
                      currentPercentage !== null && currentPercentage >= 90
                        ? 'text-emerald-400'
                        : currentPercentage !== null && currentPercentage >= 75
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {currentPercentage !== null ? `${currentPercentage.toFixed(1)}%` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {attended}/{conducted}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Remaining</span>
                  <span className="font-bold text-sm text-slate-200">
                    {remainingClasses}
                  </span>
                  <span className="text-[10px] text-slate-500 block">classes</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Max Possible</span>
                  <span className="font-bold text-sm text-indigo-300">
                    {maxPossiblePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Target requirements */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Need for 90% Target:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-200">
                    {is90Possible && requiredFor90 !== null ? (
                      `${requiredFor90} of ${remainingClasses}`
                    ) : (
                      <span className="text-rose-400 text-xs">Cannot reach</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Need for 75% Detention:</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {is75Possible && requiredFor75 !== null ? (
                      `${requiredFor75} of ${remainingClasses}`
                    ) : (
                      <span className="text-red-400 text-xs font-black">
                        IRREVERSIBLE DETENTION
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Friendly message */}
              <div className="mt-2.5 text-[11px] p-2 bg-slate-950/80 rounded border border-slate-800 text-slate-300">
                {conducted === 0 ? (
                  <span className="text-slate-500 italic">No attendance recorded</span>
                ) : status === 'SAFE' ? (
                  <span className="text-emerald-400">
                    Safe at 90%: Attend at least {requiredFor90} of {remainingClasses}. You can miss up to {maxClassesMissable90} classes.
                  </span>
                ) : status === 'AT_RISK' ? (
                  <span className="text-amber-400">
                    {is90Possible
                      ? `To reach 90%: Attend ${requiredFor90} of the next ${remainingClasses} classes.`
                      : `90% is mathematically out of reach. Maximum possible is ${maxPossiblePercentage.toFixed(1)}%.`}
                  </span>
                ) : status === 'DETENTION' ? (
                  <span className="text-rose-400 font-semibold">
                    Recovery Possible: Attend at least {requiredFor75} of the remaining {remainingClasses} classes to escape detention.
                  </span>
                ) : (
                  <span className="text-red-400 font-bold">
                    IRREVERSIBLE DETENTION: Even with 100% attendance, your attendance cannot reach 75%.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
