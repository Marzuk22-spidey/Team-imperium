import React from 'react';
import { SectionTimetable, Student } from '../types';
import { Calendar, Building, BookOpen, Clock, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  selectedSection: SectionTimetable;
  selectedStudent: Student | null;
  todayDateStr: string;
  planUntilDateStr: string;
  daysRemaining: number;
  studentsCount: number;
  onOpenTimetable: () => void;
  onOpenHolidays: () => void;
  onOpenRoster: () => void;
  activeTab: 'calculator' | 'monitor' | 'planner' | 'report' | 'schedule';
  setActiveTab: (tab: 'calculator' | 'monitor' | 'planner' | 'report' | 'schedule') => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedSection,
  selectedStudent,
  todayDateStr,
  planUntilDateStr,
  daysRemaining,
  studentsCount,
  onOpenTimetable,
  onOpenHolidays,
  onOpenRoster,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark & College */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm shadow-indigo-500/20">
              SRM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Attendance monitor
                </h1>
                <span className="hidden sm:inline text-xs text-slate-400">·</span>
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                  Semester Fall 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                SRM Institute of Science and Technology — Tiruchirappalli
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance & Forecast
            </button>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'monitor'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Timetable Monitor
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              "What-If?" Simulator
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Action Plan Report
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Class Timetable
            </button>
          </nav>

          {/* Zone 3: Actions & Timetable quick button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRoster}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View or upload student rosters"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Students</span>
              {studentsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-mono">
                  {studentsCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenHolidays}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View Semester Holidays"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Holidays</span>
            </button>

            <button
              onClick={onOpenTimetable}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View Weekly Schedule"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Weekly Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="flex lg:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Forecast
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'monitor'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Monitor
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'planner'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          "What-If?"
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'report'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Plan Report
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Timetable
        </button>
      </div>

      {/* Context Metadata Strip */}
      <div className="bg-slate-900/60 border-t border-slate-800/60 py-1.5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">{selectedSection.name}</span>
            <span>·</span>
            <span>{selectedSection.year}</span>
            <span>·</span>
            <span>{selectedSection.semester}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline flex items-center gap-1 text-slate-400">
              <Building className="w-3 h-3 text-slate-500" />
              {selectedSection.venue}
            </span>
            {selectedStudent && (
              <>
                <span>·</span>
                <span className="text-indigo-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {selectedStudent.name} ({selectedStudent.regNo})
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono tabular-nums text-xs">
            <span>
              Today: <strong className="text-slate-200">{todayDateStr}</strong>
            </span>
            <span>·</span>
            <span>
              Planning until: <strong className="text-slate-200">{planUntilDateStr}</strong>
            </span>
            <span>·</span>
            <span>
              Days left: <strong className="text-indigo-400">{daysRemaining}</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

