import React, { useState } from 'react';
import { Subject, DayOfWeek, TimetableSlot } from '../types';
import { PERIOD_TIMINGS } from '../data/timetables';
import {
  X,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  existingSubjectIds: string[];
  onAddSubject: (
    subject: Subject,
    slots: { day: DayOfWeek; period: number }[],
    conducted: number,
    attended: number,
    odCount: number,
    medicalCount: number
  ) => void;
}

const WEEKDAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  sectionName,
  existingSubjectIds,
  onAddSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [shortId, setShortId] = useState('');
  const [courseType, setCourseType] = useState<'theory' | 'lab' | 'project'>('theory');
  const [conducted, setConducted] = useState<number>(0);
  const [attended, setAttended] = useState<number>(0);
  const [odCount, setOdCount] = useState<number>(0);
  const [medicalCount, setMedicalCount] = useState<number>(0);

  // Selected schedule slots: Set of "Day-Period" strings, e.g. "Monday-2", "Wednesday-4"
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(
    new Set(['Monday-2', 'Wednesday-3', 'Friday-2'])
  );

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSlot = (day: DayOfWeek, period: number) => {
    const key = `${day}-${period}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleApplyPreset = (preset: '3_theory' | '4_theory' | 'lab_block' | 'clear') => {
    if (preset === 'clear') {
      setSelectedSlots(new Set());
    } else if (preset === '3_theory') {
      setSelectedSlots(new Set(['Monday-2', 'Wednesday-3', 'Friday-2']));
    } else if (preset === '4_theory') {
      setSelectedSlots(new Set(['Monday-1', 'Tuesday-2', 'Thursday-3', 'Friday-4']));
    } else if (preset === 'lab_block') {
      setSelectedSlots(new Set(['Tuesday-5', 'Tuesday-6', 'Tuesday-7']));
      setCourseType('lab');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName) {
      setError('Please enter a subject name.');
      return;
    }

    if (!trimmedCode) {
      setError('Please enter a course code (e.g. 21ECC305T).');
      return;
    }

    // Auto-generate unique short ID if not supplied
    let derivedId = shortId.trim().toUpperCase();
    if (!derivedId) {
      // Find unused single letter or code slug
      const alphabet = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T'];
      derivedId = alphabet.find((l) => !existingSubjectIds.includes(l)) || trimmedCode.slice(0, 4);
    }

    if (existingSubjectIds.includes(derivedId)) {
      setError(`Subject ID "${derivedId}" already exists. Please provide a different short ID.`);
      return;
    }

    if (selectedSlots.size === 0) {
      setError('Please assign at least one period slot in the weekly schedule so it appears in the Timetable Monitor.');
      return;
    }

    if (attended > conducted) {
      setError('Classes attended cannot exceed classes conducted.');
      return;
    }

    const newSubject: Subject = {
      id: derivedId,
      code: trimmedCode,
      name: trimmedName,
      isLab: courseType === 'lab',
      isProject: courseType === 'project',
    };

    const slotsList: { day: DayOfWeek; period: number }[] = [];
    selectedSlots.forEach((slotKey) => {
      const [dayStr, periodStr] = slotKey.split('-');
      slotsList.push({
        day: dayStr as DayOfWeek,
        period: parseInt(periodStr, 10),
      });
    });

    onAddSubject(
      newSubject,
      slotsList,
      conducted,
      attended,
      odCount,
      medicalCount
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Plus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Add Subject to {sectionName}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-normal">
                  Reflects in Timetable Monitor
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adds a new course to your curriculum and weekly timetable schedule.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Subject Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Computing & DevOps"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Subject Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 21ECC305T"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Short Slot ID <span className="text-slate-500">(Optional, e.g. H, I, LAB)</span>
              </label>
              <input
                type="text"
                placeholder="Auto-assigned if blank"
                value={shortId}
                onChange={(e) => setShortId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Course Classification
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCourseType('theory')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    courseType === 'theory'
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Theory
                </button>
                <button
                  type="button"
                  onClick={() => setCourseType('lab')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    courseType === 'lab'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Laboratory
                </button>
                <button
                  type="button"
                  onClick={() => setCourseType('project')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    courseType === 'project'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Project
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Slots Assignment (for Timetable Monitor) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assign Timetable Periods (Weekly Schedule)</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Select which days and periods this subject takes place. These will immediately appear in the <strong>Timetable Monitor</strong>!
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('3_theory')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  3 hrs/wk
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('4_theory')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  4 hrs/wk
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('lab_block')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Lab Block
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('clear')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Interactive Grid of Weekdays x Periods */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 overflow-x-auto">
              <div className="grid grid-cols-9 gap-1.5 text-center text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-800/80">
                <span className="text-left font-sans text-slate-500">Day</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <span key={p}>P{p}</span>
                ))}
              </div>

              {WEEKDAYS.map((day) => (
                <div key={day} className="grid grid-cols-9 gap-1.5 items-center">
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {day.slice(0, 3)}
                  </span>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => {
                    const isSelected = selectedSlots.has(`${day}-${period}`);
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => toggleSlot(day, period)}
                        className={`h-7 rounded text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                            : 'bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-850 border border-slate-800/50'
                        }`}
                        title={`${day} Period ${period} (${PERIOD_TIMINGS[period] || ''})`}
                      >
                        {isSelected ? '✓' : period}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>
                Selected: <strong className="text-indigo-400 font-mono">{selectedSlots.size}</strong> period(s) per week
              </span>
              <span className="text-slate-500">
                P1-P4 (Morning) · P5-P8 (Afternoon)
              </span>
            </div>
          </div>

          {/* Initial Attendance Numbers */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-white">
              Current Attendance Record (Classes Held So Far)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Classes Conducted</span>
                <input
                  type="number"
                  min="0"
                  value={conducted}
                  onChange={(e) => setConducted(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Classes Attended</span>
                <input
                  type="number"
                  min="0"
                  max={conducted}
                  value={attended}
                  onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-amber-400/90">Of which OD</span>
                <input
                  type="number"
                  min="0"
                  max={attended}
                  value={odCount}
                  onChange={(e) => setOdCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-orange-400/90">Of which Medical</span>
                <input
                  type="number"
                  min="0"
                  max={attended}
                  value={medicalCount}
                  onChange={(e) => setMedicalCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Add Subject &amp; Update Timetable Monitor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
