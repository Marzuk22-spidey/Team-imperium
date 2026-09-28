import React, { useState } from 'react';
import {
  SectionTimetable,
  Subject,
  DayOfWeek,
  AttendanceMark,
  ScheduledClassOccurrence,
} from '../types';
import { formatDateWithDay, getDayOfWeek, isWeekend } from '../utils/dateUtils';
import { PERIOD_TIMINGS } from '../data/timetables';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  HeartPulse,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface TimetableAttendanceMonitorProps {
  section: SectionTimetable;
  occurrencesBySubject: Record<string, ScheduledClassOccurrence[]>;
  onMarkAttendance: (
    subjectId: string,
    mark: AttendanceMark,
    delta: number,
    reason?: string
  ) => void;
  onNotification: (message: string) => void;
}

export const TimetableAttendanceMonitor: React.FC<TimetableAttendanceMonitorProps> = ({
  section,
  occurrencesBySubject,
  onMarkAttendance,
  onNotification,
}) => {
  // Store status for specific slots: Record<slotKey, AttendanceMark>
  const [slotStatuses, setSlotStatuses] = useState<Record<string, AttendanceMark>>({});

  const handleStatusChange = (
    subjectId: string,
    slotKey: string,
    newStatus: AttendanceMark
  ) => {
    const currentStatus = slotStatuses[slotKey] || 'UNMARKED';
    if (currentStatus === newStatus) return;

    setSlotStatuses((prev) => ({
      ...prev,
      [slotKey]: newStatus,
    }));

    // Calculate effect on attendance count:
    // If changing to OD: notification "OD applied — attendance recalculated."
    // If changing to MEDICAL: notification "Medical Leave applied — attendance recalculated."
    if (newStatus === 'OD') {
      onNotification('OD applied — attendance recalculated.');
    } else if (newStatus === 'MEDICAL_LEAVE') {
      onNotification('Medical Leave applied — attendance recalculated.');
    } else if (newStatus === 'PRESENT') {
      onNotification('Marked Present — attendance recalculated.');
    } else if (newStatus === 'ABSENT') {
      onNotification('Marked Absent — attendance recalculated.');
    }

    onMarkAttendance(subjectId, newStatus, 1);
  };

  // Group weekly timetable by Day
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Attendance Monitor
            </span>
            <span className="text-slate-600">·</span>
            <h2 className="text-base font-bold text-white">
              Weekly Timetable Attendance Tracker
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mark regular classes, OD, or Medical Leave. OD and Medical Leave are mathematically counted as attended (value 1).
          </p>
        </div>

        {/* Legend matching exact required colors */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {/* Light Blue: Regular Present */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-400/60 text-sky-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block shadow-sm shadow-sky-500/50" />
            <span>🟦 PRESENT (1)</span>
          </div>

          {/* Orange: OD */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-950/80 border border-orange-500/60 text-orange-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block shadow-sm shadow-orange-500/50" />
            <span>🟧 OD (1)</span>
          </div>

          {/* Orange: Medical */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-950/80 border border-orange-500/60 text-orange-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block shadow-sm shadow-orange-500/50" />
            <span>🟧 MEDICAL (1)</span>
          </div>

          {/* Red: Absent */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-500/60 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block shadow-sm shadow-rose-500/50" />
            <span>🟥 ABSENT (0)</span>
          </div>
        </div>
      </div>

      {/* Timetable Schedule Grid with interactive status buttons */}
      <div className="space-y-3">
        {days.map((day) => {
          const slots = section.schedule[day] || [];
          return (
            <div
              key={day}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">{day}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {slots.length} scheduled periods
                </span>
              </div>

              {slots.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-5">No classes scheduled</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {slots.map((s, idx) => {
                    const slotKey = `${day}-p${s.period}-${s.subjectId}-${idx}`;
                    const subject = section.subjects[s.subjectId];
                    const currentStatus = slotStatuses[slotKey] || 'PRESENT';

                    return (
                      <div
                        key={slotKey}
                        className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                          currentStatus === 'PRESENT'
                            ? 'bg-sky-950/40 border-sky-500/50 text-slate-200'
                            : currentStatus === 'OD'
                            ? 'bg-orange-950/40 border-orange-500/60 text-slate-200'
                            : currentStatus === 'MEDICAL_LEAVE'
                            ? 'bg-orange-950/40 border-orange-500/60 text-slate-200'
                            : 'bg-rose-950/40 border-rose-500/60 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                            <span className="font-bold text-slate-300">P{s.period}</span>
                            <span>{PERIOD_TIMINGS[s.period] || s.time}</span>
                          </div>

                          <div className="font-bold text-slate-100 truncate" title={subject?.name}>
                            {subject?.name || s.subjectId}
                          </div>

                          <div className="text-[10px] font-mono text-indigo-400 mt-0.5">
                            {subject?.code || s.subjectId}
                          </div>
                        </div>

                        {/* Interactive Status Selector for this slot */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(s.subjectId, slotKey, 'PRESENT')
                            }
                            className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              currentStatus === 'PRESENT'
                                ? 'bg-sky-500 text-sky-950 font-black shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-sky-300'
                            }`}
                            title="Mark Regular Present (Counts as 1)"
                          >
                            🟦 Present
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(s.subjectId, slotKey, 'OD')
                            }
                            className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              currentStatus === 'OD'
                                ? 'bg-orange-500 text-orange-950 font-black shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-orange-300'
                            }`}
                            title="Mark On Duty (Mathematically counts as 1 Present)"
                          >
                            🟧 OD
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(s.subjectId, slotKey, 'MEDICAL_LEAVE')
                            }
                            className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              currentStatus === 'MEDICAL_LEAVE'
                                ? 'bg-orange-500 text-orange-950 font-black shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-orange-300'
                            }`}
                            title="Mark Medical Leave (Mathematically counts as 1 Present)"
                          >
                            🟧 Med
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(s.subjectId, slotKey, 'ABSENT')
                            }
                            className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-500 text-white font-black shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-rose-300'
                            }`}
                            title="Mark Absent (Counts as 0)"
                          >
                            🟥 Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
