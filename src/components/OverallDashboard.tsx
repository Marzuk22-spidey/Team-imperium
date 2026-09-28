import React from 'react';
import { OverallPrediction } from '../types';
import { AttendanceScaleBar } from './AttendanceScaleBar';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CalendarCheck,
  Activity,
  Award,
} from 'lucide-react';

interface OverallDashboardProps {
  overall: OverallPrediction;
  hasAttendanceRecorded: boolean;
}

export const OverallDashboard: React.FC<OverallDashboardProps> = ({
  overall,
  hasAttendanceRecorded,
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
  } = overall;

  let statusBg = 'bg-slate-800 text-slate-300 border-slate-700';
  let statusIcon = <Activity className="w-4 h-4 text-slate-400" />;
  let statusSummaryText = 'No attendance recorded yet. Enter your classes conducted and attended above.';

  if (overallPercentage !== null) {
    if (overallStatus === 'SAFE') {
      statusBg = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      statusIcon = <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      statusSummaryText = 'You are in the Safe Target Zone (≥90%). Keep it up to avoid academic detention warnings.';
    } else if (overallStatus === 'AT_RISK') {
      statusBg = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      statusIcon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
      statusSummaryText = 'You are At Risk (75% - 89.9%). You must maintain consistent attendance to achieve the 90% safe mark.';
    } else if (overallStatus === 'DETENTION') {
      statusBg = 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      statusIcon = <AlertOctagon className="w-4 h-4 text-rose-400" />;
      statusSummaryText = 'Detention Zone Alert (<75%)! You will be debarred from exams unless you recover to 75%. Recovery is still possible.';
    } else {
      statusBg = 'bg-red-950 text-red-200 border-red-500 animate-pulse';
      statusIcon = <AlertOctagon className="w-4 h-4 text-red-400" />;
      statusSummaryText = 'IRREVERSIBLE DETENTION: Even with 100% attendance in all remaining classes, overall attendance will finish below 75%.';
    }
  }

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Overall Attendance */}
        <div className="col-span-2 lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Overall Attendance
              </span>
              {statusIcon}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-3xl font-extrabold text-white">
                {overallPercentage !== null ? overallPercentage.toFixed(1) : '—'}
              </span>
              <span className="text-base text-slate-400 font-bold">
                {overallPercentage !== null ? '%' : ''}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
              {totalAttended} / {totalConducted} classes attended
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${statusBg}`}
            >
              {overallStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Card 2: Classes Remaining */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Classes Remaining
              </span>
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 font-mono tabular-nums text-3xl font-extrabold text-indigo-300">
              {totalRemainingClasses}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Scheduled attendance slots until selected planning date.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
            Total at finish: {totalConducted + totalRemainingClasses}
          </div>
        </div>

        {/* Card 3: Subjects Below 90% */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Subjects &lt; 90%
              </span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 font-mono tabular-nums text-3xl font-extrabold text-amber-300">
              {subjectsBelow90Count}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Courses not yet meeting your safe 90% attendance goal.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-amber-400/80">
            Target: 0 subjects below 90%
          </div>
        </div>

        {/* Card 4: Subjects Below 75% */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Detention Zone (&lt; 75%)
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 font-mono tabular-nums text-3xl font-extrabold text-rose-400">
              {subjectsBelow75Count}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Courses below SRM's mandatory 75% examination threshold.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-rose-400/80 font-bold">
            Debarment risk if not recovered
          </div>
        </div>

        {/* Card 5: Irrecoverable Subjects */}
        <div className={`rounded-xl p-4 shadow-sm flex flex-col justify-between border ${
          irreversibleDetentionCount > 0
            ? 'bg-red-950/70 border-red-500 shadow-red-950/40 animate-pulse'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${
                irreversibleDetentionCount > 0 ? 'text-red-300' : 'text-slate-400'
              }`}>
                Irreversible Detention
              </span>
              <AlertOctagon className={`w-4 h-4 ${
                irreversibleDetentionCount > 0 ? 'text-red-400' : 'text-slate-500'
              }`} />
            </div>
            <div className={`mt-2 font-mono tabular-nums text-3xl font-extrabold ${
              irreversibleDetentionCount > 0 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {irreversibleDetentionCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Courses mathematically unable to reach 75% even with 100% attendance.
            </p>
          </div>
          <div className={`mt-3 pt-2.5 border-t ${
            irreversibleDetentionCount > 0 ? 'border-red-800 text-red-300 font-bold' : 'border-slate-800 text-slate-500'
          } text-[10px]`}>
            {irreversibleDetentionCount > 0 ? 'Action required immediately' : 'Zero irrecoverable subjects'}
          </div>
        </div>
      </div>

      {/* Horizontal Spectrum Bar */}
      <AttendanceScaleBar
        percentage={overallPercentage}
        status={overallStatus}
      />
    </div>
  );
};
