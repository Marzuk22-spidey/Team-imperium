import React, { useState } from 'react';
import { Subject, SubjectAttendanceRecord } from '../types';
import {
  RotateCcw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Minus,
  Plus,
  HeartPulse,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AttendanceInputsProps {
  subjects: Record<string, Subject>;
  attendanceData: Record<string, SubjectAttendanceRecord>;
  onAttendanceChange: (
    subjectId: string,
    field: 'conducted' | 'attended',
    value: number
  ) => void;
  onDetailedAttendanceChange?: (
    subjectId: string,
    regularPresent: number,
    odCount: number,
    medicalCount: number,
    conducted: number
  ) => void;
  onSetAllConducted: (conducted: number) => void;
  onLoadDemoScenario: (scenarioType: 'mixed' | 'safe' | 'at_risk' | 'detention' | 'irreversible') => void;
  onClearAll: () => void;
  onNotification?: (message: string) => void;
  isDemoActive: boolean;
  onOpenAddSubject?: () => void;
}

export const AttendanceInputs: React.FC<AttendanceInputsProps> = ({
  subjects,
  attendanceData,
  onAttendanceChange,
  onDetailedAttendanceChange,
  onSetAllConducted,
  onLoadDemoScenario,
  onClearAll,
  onNotification,
  isDemoActive,
  onOpenAddSubject,
}) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const subjectList = Object.values(subjects);

  const handleInputChange = (
    subjectId: string,
    field: 'conducted' | 'attended',
    valStr: string
  ) => {
    const rawVal = parseInt(valStr, 10);
    const val = isNaN(rawVal) ? 0 : Math.max(0, rawVal);
    onAttendanceChange(subjectId, field, val);
  };

  const handleStep = (
    subjectId: string,
    field: 'conducted' | 'attended',
    delta: number
  ) => {
    const current = attendanceData[subjectId] || { conducted: 0, attended: 0 };
    const curVal = current[field] || 0;
    const newVal = Math.max(0, curVal + delta);
    onAttendanceChange(subjectId, field, newVal);
  };

  const handleAdjustOD = (subjectId: string, delta: number) => {
    const rec = attendanceData[subjectId] || { conducted: 0, attended: 0, odCount: 0, medicalCount: 0 };
    const conducted = rec.conducted || 0;
    const odCount = Math.max(0, (rec.odCount || 0) + delta);
    const medicalCount = rec.medicalCount || 0;
    const regularPresent = rec.regularPresent !== undefined
      ? rec.regularPresent
      : Math.max(0, (rec.attended || 0) - (rec.odCount || 0) - (rec.medicalCount || 0));

    // Ensure total does not exceed conducted
    const newTotalAttended = Math.min(conducted, regularPresent + odCount + medicalCount);
    
    if (onDetailedAttendanceChange) {
      onDetailedAttendanceChange(subjectId, regularPresent, odCount, medicalCount, conducted);
    } else {
      onAttendanceChange(subjectId, 'attended', newTotalAttended);
    }

    onNotification?.('OD applied — attendance recalculated.');
  };

  const handleAdjustMedical = (subjectId: string, delta: number) => {
    const rec = attendanceData[subjectId] || { conducted: 0, attended: 0, odCount: 0, medicalCount: 0 };
    const conducted = rec.conducted || 0;
    const odCount = rec.odCount || 0;
    const medicalCount = Math.max(0, (rec.medicalCount || 0) + delta);
    const regularPresent = rec.regularPresent !== undefined
      ? rec.regularPresent
      : Math.max(0, (rec.attended || 0) - (rec.odCount || 0) - (rec.medicalCount || 0));

    const newTotalAttended = Math.min(conducted, regularPresent + odCount + medicalCount);

    if (onDetailedAttendanceChange) {
      onDetailedAttendanceChange(subjectId, regularPresent, odCount, medicalCount, conducted);
    } else {
      onAttendanceChange(subjectId, 'attended', newTotalAttended);
    }

    onNotification?.('Medical Leave applied — attendance recalculated.');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Step 3
            </span>
            <h2 className="text-base font-bold text-white">Enter Current Attendance Data</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter classes conducted and attended. Supports 🟦 Regular Present, 🟧 On Duty (OD), 🟧 Medical Leave, and 🟥 Absent.
          </p>
        </div>

        {/* Action presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Demo Scenario Selector */}
          <div className="relative inline-flex items-center">
            <button
              onClick={() => onLoadDemoScenario('mixed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                isDemoActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isDemoActive ? 'Demo Active' : 'Load Demo Scenarios'}</span>
            </button>
          </div>

          {/* Quick preset scenarios */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-[11px]">
            <span className="text-slate-400 px-1.5">Preset:</span>
            <button
              onClick={() => onLoadDemoScenario('safe')}
              className="px-2 py-0.5 rounded text-emerald-400 hover:bg-slate-800 cursor-pointer"
              title="Loads safe attendance above 90%"
            >
              Safe (92%)
            </button>
            <button
              onClick={() => onLoadDemoScenario('at_risk')}
              className="px-2 py-0.5 rounded text-amber-400 hover:bg-slate-800 cursor-pointer"
              title="Loads attendance at risk (80-85%)"
            >
              At Risk (82%)
            </button>
            <button
              onClick={() => onLoadDemoScenario('detention')}
              className="px-2 py-0.5 rounded text-rose-400 hover:bg-slate-800 cursor-pointer"
              title="Loads attendance in detention zone with recovery possible"
            >
              Detention (68%)
            </button>
            <button
              onClick={() => onLoadDemoScenario('irreversible')}
              className="px-2 py-0.5 rounded text-red-400 hover:bg-slate-800 font-bold cursor-pointer"
              title="Loads attendance where 75% recovery is mathematically impossible"
            >
              Irreversible (55%)
            </button>
          </div>

          {onOpenAddSubject && (
            <button
              type="button"
              onClick={onOpenAddSubject}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Add a new subject to curriculum and timetable"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          )}

          <button
            onClick={onClearAll}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset all inputs to 0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {isDemoActive && (
        <div className="px-3.5 py-2 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-xs text-indigo-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Demonstration Mode:</strong> Sample academic attendance data loaded for evaluation. You can edit any numbers below or clear.
            </span>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-slate-300 hover:text-white underline cursor-pointer shrink-0 ml-3"
          >
            Clear Data
          </button>
        </div>
      )}

      {/* Subject Input Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {subjectList.map((sub) => {
          const rec = attendanceData[sub.id] || { conducted: 0, attended: 0 };
          const conducted = rec.conducted || 0;
          const attended = rec.attended || 0;
          const odCount = rec.odCount || 0;
          const medicalCount = rec.medicalCount || 0;
          const regularPresent = rec.regularPresent !== undefined
            ? rec.regularPresent
            : Math.max(0, attended - odCount - medicalCount);
          const absentCount = Math.max(0, conducted - attended);

          const percentage =
            conducted > 0 ? ((attended / conducted) * 100).toFixed(1) : null;

          const numPercentage = percentage !== null ? parseFloat(percentage) : null;

          let badgeColor = 'text-slate-400 bg-slate-800/60 border-slate-700';
          let statusLabel = 'No Record';

          if (numPercentage !== null) {
            if (numPercentage >= 90) {
              badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
              statusLabel = 'SAFE (≥90%)';
            } else if (numPercentage >= 75) {
              badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
              statusLabel = 'AT RISK';
            } else {
              badgeColor = 'text-rose-400 bg-rose-950/60 border-rose-500/40';
              statusLabel = 'DETENTION (<75%)';
            }
          }

          const isExpanded = expandedSubject === sub.id;

          return (
            <div
              key={sub.id}
              className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold block truncate">
                      {sub.code}
                    </span>
                    <h3 className="text-xs font-bold text-slate-200 truncate mt-0.5" title={sub.name}>
                      {sub.name}
                    </h3>
                  </div>

                  {/* Percentage Display */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border tabular-nums ${badgeColor}`}
                    >
                      {percentage !== null ? `${percentage}%` : 'No Record'}
                    </div>
                  </div>
                </div>

                {/* Sub status tag */}
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{statusLabel}</span>
                  <div className="flex items-center gap-1.5">
                    {sub.isLab && <span className="text-indigo-400 text-[10px]">Practical / Lab</span>}
                    {sub.isProject && <span className="text-amber-400 text-[10px]">Project Slot</span>}
                  </div>
                </div>
              </div>

              {/* Number Inputs for Conducted & Attended */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                {/* Conducted Input */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Conducted
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleStep(sub.id, 'conducted', -1)}
                      className="p-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-l cursor-pointer"
                      title="Decrease conducted"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={conducted === 0 && !isDemoActive && conducted === rec.conducted ? '' : conducted}
                      placeholder="0"
                      onChange={(e) =>
                        handleInputChange(sub.id, 'conducted', e.target.value)
                      }
                      className="w-full bg-slate-900 border-y border-slate-700 text-center text-xs font-mono tabular-nums text-slate-100 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep(sub.id, 'conducted', 1)}
                      className="p-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-r cursor-pointer"
                      title="Increase conducted"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Attended Input (Total = Regular + OD + Medical) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400 font-medium">
                      Attended (Total)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onAttendanceChange(sub.id, 'attended', conducted)
                      }
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      title="Set attended equal to conducted"
                    >
                      100%
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleStep(sub.id, 'attended', -1)}
                      className="p-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-l cursor-pointer"
                      title="Decrease attended"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={conducted}
                      value={conducted === 0 && attended === 0 && !isDemoActive ? '' : attended}
                      placeholder="0"
                      onChange={(e) =>
                        handleInputChange(sub.id, 'attended', e.target.value)
                      }
                      className="w-full bg-slate-900 border-y border-slate-700 text-center text-xs font-mono tabular-nums text-slate-100 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep(sub.id, 'attended', 1)}
                      className="p-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-r cursor-pointer"
                      title="Increase attended"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Bar: 🟦 Light Blue = Regular Present, 🟧 Orange = OD / Medical, 🟥 Red = Absent */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-300 font-bold" title="Regular Present">
                      🟦 {regularPresent} Present
                    </span>
                    {(odCount > 0 || medicalCount > 0) && (
                      <span className="text-orange-400 font-bold" title="On Duty & Medical Leave">
                        🟧 {odCount + medicalCount} OD/Med
                      </span>
                    )}
                    <span className="text-rose-400 font-bold" title="Absent">
                      🟥 {absentCount} Absent
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                    className="text-slate-400 hover:text-white flex items-center gap-0.5 text-[10px] underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide OD/Med' : 'Adjust OD / Med'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expanded Detailed Adjusters for OD and Medical Leave */}
                {isExpanded && (
                  <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded-md space-y-2 text-[11px] animate-in fade-in duration-150">
                    {/* OD Adjuster */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-orange-300">
                        <Award className="w-3.5 h-3.5 text-orange-400" />
                        <span>🟧 On Duty (OD):</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <button
                          type="button"
                          onClick={() => handleAdjustOD(sub.id, -1)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-white">{odCount}</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustOD(sub.id, 1)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Medical Leave Adjuster */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-orange-300">
                        <HeartPulse className="w-3.5 h-3.5 text-orange-400" />
                        <span>🟧 Medical Leave:</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <button
                          type="button"
                          onClick={() => handleAdjustMedical(sub.id, -1)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-white">{medicalCount}</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustMedical(sub.id, 1)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                      OD and Medical Leave mathematically count as Present (value = 1), recovering your percentage.
                    </p>
                  </div>
                )}
              </div>

              {/* Validation Warning */}
              {attended > conducted && (
                <div className="mt-2 text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>Attended cannot exceed conducted</span>
                </div>
              )}
            </div>
          );
        })}

        {onOpenAddSubject && (
          <button
            type="button"
            onClick={onOpenAddSubject}
            className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-300 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[140px] group"
          >
            <div className="p-2.5 rounded-full bg-slate-900 group-hover:bg-indigo-600/30 text-slate-400 group-hover:text-indigo-400 border border-slate-800 group-hover:border-indigo-500/40 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Add New Subject</span>
            <span className="text-[11px] text-slate-500 group-hover:text-slate-400 text-center">
              Assign timetable slots to reflect in Timetable Monitor
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

