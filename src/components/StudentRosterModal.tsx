import React, { useState, useRef, useMemo } from 'react';
import { Student } from '../types';
import { processRosterFile } from '../utils/rosterParser';
import {
  X,
  Upload,
  Search,
  Users,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  UserCheck,
  UserX,
} from 'lucide-react';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onStudentsUpdated: (students: Student[]) => void;
  selectedStudent: Student | null;
  onSelectStudent: (student: Student | null) => void;
}

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  students,
  onStudentsUpdated,
  selectedStudent,
  onSelectStudent,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute unique filter options
  const departments = useMemo(() => {
    const s = new Set<string>();
    students.forEach((st) => st.department && s.add(st.department));
    return Array.from(s).sort();
  }, [students]);

  const years = useMemo(() => {
    const s = new Set<string>();
    students.forEach((st) => st.year && s.add(st.year));
    return Array.from(s).sort();
  }, [students]);

  const sections = useMemo(() => {
    const s = new Set<string>();
    students.forEach((st) => st.section && s.add(st.section));
    return Array.from(s).sort();
  }, [students]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      if (deptFilter !== 'ALL' && st.department !== deptFilter) return false;
      if (yearFilter !== 'ALL' && st.year !== yearFilter) return false;
      if (sectionFilter !== 'ALL' && st.section !== sectionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = st.name.toLowerCase().includes(q);
        const matchesReg = st.regNo.toLowerCase().includes(q);
        if (!matchesName && !matchesReg) return false;
      }
      return true;
    });
  }, [students, deptFilter, yearFilter, sectionFilter, searchQuery]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await processRosterFile(selectedFile, (stage) => {
        setProcessingStage(stage);
      });

      if (res.success && res.students.length > 0) {
        onStudentsUpdated(res.students);
        setSuccessMessage(
          res.summary || `Extracted ${res.students.length} student records successfully.`
        );
        setSelectedFile(null);
      } else {
        setError(res.error || 'Could not parse student roster.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process student roster.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Student Roster & Cohort Records
              </h2>
              <p className="text-xs text-slate-400">
                Upload class rosters (PDF, CSV, XLSX) or select a student for personalized tracking.
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Upload Strip */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload Student Roster</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  AI extracts Student Name, Register Number, Department, Section, and Historical Attendance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{selectedFile ? selectedFile.name : 'Choose Roster File'}</span>
                </button>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleStartUpload}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Process Roster</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* AI Progress indicator */}
            {isProcessing && (
              <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-xs text-indigo-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                <span>{processingStage || 'AI is organizing student records...'}</span>
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Current Selection & Active Mode Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Active Profile:</span>
              {selectedStudent ? (
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-mono">
                    {selectedStudent.regNo}
                  </span>
                  <span>{selectedStudent.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    ({selectedStudent.section})
                  </span>
                </div>
              ) : (
                <span className="text-slate-300 font-medium italic">
                  Self-guided student mode (unlinked)
                </span>
              )}
            </div>

            {selectedStudent && (
              <button
                onClick={() => onSelectStudent(null)}
                className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
              >
                Clear Selection (Return to Self-Guided)
              </button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            {/* Search Input */}
            <div className="relative sm:col-span-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or Reg No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Dept Filter */}
            <div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing <strong>{filteredStudents.length}</strong> of {students.length} students
              </span>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No students match the criteria</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {students.length === 0
                    ? 'Upload a student roster spreadsheet or PDF to populate real student profiles.'
                    : 'Try clearing your filters or search term to see records.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredStudents.map((st) => {
                  const isSelected = selectedStudent?.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => onSelectStudent(isSelected ? null : st)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500/50 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white truncate">{st.name}</span>
                          {isSelected ? (
                            <span className="p-0.5 bg-indigo-500 text-white rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {st.department}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-mono text-indigo-400 mt-1">
                          {st.regNo}
                        </div>

                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{st.section}</span>
                          <span>·</span>
                          <span>{st.year}</span>
                        </div>
                      </div>

                      {st.historicalPercentage !== undefined && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Recorded Attendance:</span>
                          <span
                            className={`font-mono font-bold ${
                              st.historicalPercentage >= 90
                                ? 'text-emerald-400'
                                : st.historicalPercentage >= 75
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {st.historicalPercentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
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
