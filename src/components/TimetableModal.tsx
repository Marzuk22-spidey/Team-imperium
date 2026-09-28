import React from 'react';
import { SectionTimetable, DayOfWeek } from '../types';
import { PERIOD_TIMINGS } from '../data/timetables';
import { X, Clock, Building, BookOpen, Layers } from 'lucide-react';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SectionTimetable;
  includeProjectSlots: boolean;
  onToggleProjectSlots: (val: boolean) => void;
}

const WEEKDAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TimetableModal: React.FC<TimetableModalProps> = ({
  isOpen,
  onClose,
  section,
  includeProjectSlots,
  onToggleProjectSlots,
}) => {
  if (!isOpen) return null;

  const hasProjectSlot = Object.keys(section.subjects).includes('B-Proj');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-indigo-400">
                Official Timetable
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {section.year} ({section.semester})
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {section.name} — Weekly Schedule
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Venue: {section.venue}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Optional Project Slot Setting */}
          {hasProjectSlot && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg flex items-center justify-between text-xs text-amber-200">
              <div>
                <span className="font-bold">Project Slot Configuration:</span>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  B-Proj is scheduled in this section. Toggle whether attendance is strictly monitored for this slot.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0 ml-4 font-semibold text-white">
                <input
                  type="checkbox"
                  checked={includeProjectSlots}
                  onChange={(e) => onToggleProjectSlots(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Include B-Proj in Attendance</span>
              </label>
            </div>
          )}

          {/* Timetable Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3 w-28">Day</th>
                  <th className="py-2.5 px-3">Scheduled Slots (Periods & Timings)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {WEEKDAYS.map((day) => {
                  const slots = section.schedule[day] || [];
                  return (
                    <tr key={day} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-bold text-slate-200 align-top">
                        {day}
                      </td>
                      <td className="py-3 px-3">
                        {slots.length === 0 ? (
                          <span className="text-slate-500 italic">No classes scheduled</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {slots.map((s, idx) => {
                              const sub = section.subjects[s.subjectId];
                              const isProject = s.isProject;
                              const isLab = sub?.isLab || s.subjectId.includes('LAB');

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between min-w-[130px] ${
                                    isProject
                                      ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                                      : isLab
                                      ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200'
                                      : 'bg-slate-950 border-slate-800 text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                                    <span>P{s.period}</span>
                                    <span>{PERIOD_TIMINGS[s.period] || s.time}</span>
                                  </div>
                                  <div className="font-bold text-slate-100 flex items-center gap-1">
                                    <span>{s.subjectId}</span>
                                    {sub && (
                                      <span className="text-[10px] text-slate-400 font-normal truncate max-w-[90px]">
                                        {sub.code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {sub?.name || s.subjectId}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subject Legend Roster */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Subject Code Directory
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {Object.entries(section.subjects).map(([id, sub]) => (
                <div
                  key={id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2.5"
                >
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-indigo-400 shrink-0">
                    {id}
                  </span>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {sub.code}
                    </span>
                    <span className="font-semibold text-slate-200 block truncate" title={sub.name}>
                      {sub.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Close Timetable
          </button>
        </div>
      </div>
    </div>
  );
};
