import React, { useState } from 'react';
import { Holiday } from '../types';
import { formatDateWithDay, SEMESTER_START, SEMESTER_END } from '../utils/dateUtils';
import { X, Calendar, Plus, Trash2, RotateCcw } from 'lucide-react';
import { DEFAULT_HOLIDAYS } from '../data/holidays';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: Holiday[];
  onUpdateHolidays: (updated: Holiday[]) => void;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onUpdateHolidays,
}) => {
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) {
      setError('Please provide both date and holiday title.');
      return;
    }

    if (newDate < SEMESTER_START || newDate > SEMESTER_END) {
      setError(`Holiday must fall within semester dates (${SEMESTER_START} to ${SEMESTER_END}).`);
      return;
    }

    if (holidays.some((h) => h.date === newDate)) {
      setError('A holiday already exists on this date.');
      return;
    }

    const updated = [...holidays, { date: newDate, name: newName.trim() }].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
    onUpdateHolidays(updated);
    setNewDate('');
    setNewName('');
    setError(null);
  };

  const handleRemoveHoliday = (dateToRemove: string) => {
    onUpdateHolidays(holidays.filter((h) => h.date !== dateToRemove));
  };

  const handleResetToDefault = () => {
    onUpdateHolidays(DEFAULT_HOLIDAYS);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Semester Holiday Calendar
              </h2>
              <p className="text-xs text-slate-400">
                Official days when scheduled classes are excluded from calculation.
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Add Custom Holiday Form */}
          <form
            onSubmit={handleAddHoliday}
            className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3"
          >
            <span className="text-xs font-bold text-slate-200 block">
              Add Custom Official / College Holiday
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                type="date"
                min={SEMESTER_START}
                max={SEMESTER_END}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <input
                type="text"
                placeholder="Holiday Name (e.g. Milan Fest)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="sm:col-span-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {error && <p className="text-[11px] text-rose-400">{error}</p>}
          </form>

          {/* Holiday List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Configured Holidays ({holidays.length})</span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Default List</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              {holidays.map((h) => (
                <div
                  key={h.date}
                  className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-900/40"
                >
                  <div>
                    <span className="font-semibold text-slate-100 block">
                      {h.name}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {formatDateWithDay(h.date)}
                    </span>
                    {h.description && (
                      <span className="text-[10px] text-slate-500 block">
                        {h.description}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveHoliday(h.date)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Remove holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
