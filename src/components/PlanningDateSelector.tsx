import React, { useState } from 'react';
import {
  Calendar,
  AlertCircle,
  Sparkles,
  Clock,
  RotateCcw,
} from 'lucide-react';
import {
  formatReadableDate,
  formatDateWithDay,
  SEMESTER_START,
  SEMESTER_END,
  toDateString,
  parseDateString,
} from '../utils/dateUtils';

interface PlanningDateSelectorProps {
  todayDateStr: string;
  effectiveStartDateStr: string;
  planUntilDateStr: string;
  onPlanUntilChange: (newDate: string) => void;
  daysRemaining: number;
  totalScheduledClasses: number;
  isBeforeSemester: boolean;
  isAfterSemester: boolean;
  simulatedDate: string | null;
  onSimulatedDateChange: (simDate: string | null) => void;
}

export const PlanningDateSelector: React.FC<PlanningDateSelectorProps> = ({
  todayDateStr,
  effectiveStartDateStr,
  planUntilDateStr,
  onPlanUntilChange,
  daysRemaining,
  totalScheduledClasses,
  isBeforeSemester,
  isAfterSemester,
  simulatedDate,
  onSimulatedDateChange,
}) => {
  const [showSimModal, setShowSimModal] = useState(false);
  const [customSimDate, setCustomSimDate] = useState(todayDateStr);
  const [dateError, setDateError] = useState<string | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    if (val < effectiveStartDateStr) {
      setDateError(`Planning date cannot be earlier than today (${effectiveStartDateStr}).`);
      return;
    }

    if (val > SEMESTER_END) {
      setDateError(`Planning date cannot exceed semester end (${SEMESTER_END}).`);
      return;
    }

    setDateError(null);
    onPlanUntilChange(val);
  };

  const setPreset = (targetDate: string) => {
    const safeDate = targetDate > SEMESTER_END ? SEMESTER_END : targetDate;
    if (safeDate < effectiveStartDateStr) {
      setDateError(`Preset date is earlier than current calculation date.`);
      return;
    }
    setDateError(null);
    onPlanUntilChange(safeDate);
  };

  const handleSetTwoWeeks = () => {
    const d = parseDateString(effectiveStartDateStr);
    d.setUTCDate(d.getUTCDate() + 14);
    const twoWeeksStr = toDateString(d);
    setPreset(twoWeeksStr > SEMESTER_END ? SEMESTER_END : twoWeeksStr);
  };

  const handleSetFourWeeks = () => {
    const d = parseDateString(effectiveStartDateStr);
    d.setUTCDate(d.getUTCDate() + 28);
    const fourWeeksStr = toDateString(d);
    setPreset(fourWeeksStr > SEMESTER_END ? SEMESTER_END : fourWeeksStr);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Step 2
            </span>
            <h2 className="text-base font-bold text-white">Select Planning Date</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure how far into the semester you want to predict your attendance. Classes are counted day-by-day.
          </p>
        </div>

        {/* Date Simulation Tool */}
        <button
          onClick={() => setShowSimModal(!showSimModal)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 self-start sm:self-auto py-1 px-2 rounded border border-slate-800 bg-slate-950/60"
          title="Simulate a different point in the semester"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {simulatedDate ? `Simulating: ${simulatedDate}` : 'Simulate Date'}
          </span>
        </button>
      </div>

      {showSimModal && (
        <div className="mb-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-200">
              Simulate Academic Calendar Date
            </span>
            {simulatedDate && (
              <button
                onClick={() => {
                  onSimulatedDateChange(null);
                  setCustomSimDate(todayDateStr);
                }}
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset to Real Browser Date
              </button>
            )}
          </div>
          <p className="text-slate-400 text-[11px] mb-2.5">
            Change "Today" to any date in Fall 2026 to test attendance predictions at different semester stages.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              min={SEMESTER_START}
              max={SEMESTER_END}
              value={customSimDate}
              onChange={(e) => setCustomSimDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => onSimulatedDateChange(customSimDate)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-xs"
            >
              Apply Simulation
            </button>
          </div>
        </div>
      )}

      {/* Date Information Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block">Today's Date</span>
          <span className="font-mono tabular-nums text-slate-200 font-semibold">
            {formatDateWithDay(effectiveStartDateStr)}
          </span>
          {isBeforeSemester && (
            <span className="text-[10px] text-amber-400 block">
              Pre-semester (Starting 29 Aug)
            </span>
          )}
          {isAfterSemester && (
            <span className="text-[10px] text-rose-400 block">Semester Ended</span>
          )}
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block">Plan Until</span>
          <span className="font-mono tabular-nums text-indigo-300 font-bold">
            {formatDateWithDay(planUntilDateStr)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            End: {formatReadableDate(SEMESTER_END)}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block">Calendar Days Left</span>
          <span className="font-mono tabular-nums text-slate-200 font-bold text-sm">
            {daysRemaining} days
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block">Scheduled Class Slots</span>
          <span className="font-mono tabular-nums text-emerald-400 font-bold text-sm">
            {totalScheduledClasses} slots
          </span>
        </div>
      </div>

      {/* Input & Quick Presets */}
      <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label htmlFor="planUntil" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
            Choose Custom Date:
          </label>
          <input
            id="planUntil"
            type="date"
            min={effectiveStartDateStr}
            max={SEMESTER_END}
            value={planUntilDateStr}
            onChange={handleDateChange}
            className="bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden lg:inline">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setPreset(SEMESTER_END)}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
              planUntilDateStr === SEMESTER_END
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            End of Semester (29 Nov)
          </button>
          <button
            type="button"
            onClick={() => setPreset('2026-10-31')}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
              planUntilDateStr === '2026-10-31'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            End of Oct (31 Oct)
          </button>
          <button
            type="button"
            onClick={handleSetFourWeeks}
            className="px-2.5 py-1.5 rounded-md border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            +4 Weeks
          </button>
          <button
            type="button"
            onClick={handleSetTwoWeeks}
            className="px-2.5 py-1.5 rounded-md border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            +2 Weeks
          </button>
        </div>
      </div>

      {dateError && (
        <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{dateError}</span>
        </div>
      )}
    </div>
  );
};
