import React from 'react';
import { SectionTimetable } from '../types';
import { Building, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface SectionSelectorProps {
  sections: SectionTimetable[];
  selectedSection: SectionTimetable;
  onSelectSection: (section: SectionTimetable) => void;
  onViewTimetable: () => void;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({
  sections,
  selectedSection,
  onSelectSection,
  onViewTimetable,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Step 1
            </span>
            <h2 className="text-base font-bold text-white">Select Class Section</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose from the 10 official SRM academic sections to load its real timetable and subject roster.
          </p>
        </div>

        <button
          onClick={onViewTimetable}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 self-start sm:self-auto cursor-pointer"
        >
          View Section Timetable &rarr;
        </button>
      </div>

      {/* Grid of 10 Sections */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {sections.map((sec) => {
          const isSelected = sec.id === selectedSection.id;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec)}
              className={`text-left p-3 rounded-lg border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {sec.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {sec.isCustomUploaded && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[9px] font-bold text-purple-300">
                        AI
                      </span>
                    )}
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>{sec.year}</span>
                  <span>·</span>
                  <span>{sec.semester}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 truncate flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{sec.venue}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Section Details Banner */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Class:</span>
            <strong className="text-white">{selectedSection.name}</strong>
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-400">Year: </span>
            <span className="text-slate-200">{selectedSection.year}</span>
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-400">Semester: </span>
            <span className="text-slate-200">{selectedSection.semester}</span>
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-400">Venue: </span>
            <span className="text-slate-200">{selectedSection.venue}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Subjects: </span>
            <span className="text-indigo-300 font-semibold">
              {Object.keys(selectedSection.subjects).length} Courses
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Section ID: <span className="text-slate-300">{selectedSection.id}</span>
        </div>
      </div>
    </div>
  );
};
