import React from 'react';
import {
  Student,
  SectionTimetable,
  OverallPrediction,
  SubjectPrediction,
} from '../types';
import {
  exportSingleStudentCSV,
  exportSingleStudentXLSX,
  exportSectionSummaryCSV,
  exportSectionSummaryXLSX,
} from '../utils/studentExporter';
import {
  User,
  Users,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  HeartPulse,
  Award,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface StudentProfileCardProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student | null) => void;
  selectedSection: SectionTimetable;
  overall: OverallPrediction;
  predictions: SubjectPrediction[];
  onOpenRosterModal: () => void;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  selectedSection,
  overall,
  predictions,
  onOpenRosterModal,
}) => {
  // Filter students matching currently active section
  const sectionStudents = students.filter(
    (s) =>
      s.section.toLowerCase().trim() === selectedSection.name.toLowerCase().trim() ||
      s.section.toLowerCase().includes(selectedSection.id.toLowerCase())
  );

  // Available students list (fall back to all if section has none)
  const candidateStudents = sectionStudents.length > 0 ? sectionStudents : students;

  const handleStudentDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val || val === 'MANUAL_MODE') {
      onSelectStudent(null);
    } else {
      const found = students.find((s) => s.id === val);
      if (found) {
        onSelectStudent(found);
      }
    }
  };

  const handleExportStudentCSV = () => {
    const targetStudent = selectedStudent || {
      id: 'STUDENT_01',
      name: 'Current Student Session',
      regNo: 'RA2411000000000',
      section: selectedSection.name,
      department: selectedSection.department || 'Engineering',
      year: selectedSection.year,
    };
    exportSingleStudentCSV(targetStudent, overall, predictions, selectedSection);
  };

  const handleExportStudentXLSX = () => {
    const targetStudent = selectedStudent || {
      id: 'STUDENT_01',
      name: 'Current Student Session',
      regNo: 'RA2411000000000',
      section: selectedSection.name,
      department: selectedSection.department || 'Engineering',
      year: selectedSection.year,
    };
    exportSingleStudentXLSX(targetStudent, overall, predictions, selectedSection);
  };

  const handleExportSectionCSV = () => {
    exportSectionSummaryCSV(selectedSection, candidateStudents, selectedSection.subjects);
  };

  const handleExportSectionXLSX = () => {
    exportSectionSummaryXLSX(selectedSection, candidateStudents, selectedSection.subjects);
  };

  const statusBadge = () => {
    const status = overall.overallStatus;
    if (status === 'SAFE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SAFE ZONE (≥ 90%)</span>
        </span>
      );
    }
    if (status === 'AT_RISK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 border border-amber-500/50 text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>AT RISK (75% - 89.9%)</span>
        </span>
      );
    }
    if (status === 'DETENTION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/90 border border-rose-500/60 text-rose-300">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>DETENTION ZONE (&lt; 75%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-950 border-2 border-rose-600 text-rose-200 animate-pulse">
        <AlertOctagon className="w-4 h-4 text-rose-500" />
        <span>IRREVERSIBLE DETENTION</span>
      </span>
    );
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Top Bar: Selector + Roster controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Student Profile & Selector
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-medium">
                {selectedSection.name}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {selectedStudent ? selectedStudent.name : 'Self-Guided Manual Entry Mode'}
            </h3>
          </div>
        </div>

        {/* Student Selector Dropdown & Upload Roster button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <select
              value={selectedStudent?.id || 'MANUAL_MODE'}
              onChange={handleStudentDropdownChange}
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="MANUAL_MODE">
                👤 Self-Guided Manual Entry
              </option>
              {candidateStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.regNo})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={onOpenRosterModal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Upload and manage student rosters"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Roster Manager ({students.length})</span>
          </button>
        </div>
      </div>

      {/* Main Profile Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Name & Reg */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-medium">Student Identification</div>
          <div className="mt-1">
            <div className="text-sm font-bold text-white truncate">
              {selectedStudent ? selectedStudent.name : 'Self-Guided Student'}
            </div>
            <div className="text-xs font-mono text-indigo-400 font-semibold mt-0.5">
              {selectedStudent ? selectedStudent.regNo : 'Self / Unregistered'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Section: <strong className="text-slate-300">{selectedSection.name}</strong>
            </div>
          </div>
        </div>

        {/* Overall % & Status */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Overall Attendance</span>
            {statusBadge()}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono ${
                overall.overallPercentage === null
                  ? 'text-slate-400'
                  : overall.overallPercentage >= 90
                  ? 'text-emerald-400'
                  : overall.overallPercentage >= 75
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {overall.overallPercentage !== null
                ? `${overall.overallPercentage.toFixed(1)}%`
                : '0.0%'}
            </span>
            <span className="text-xs text-slate-400">
              ({overall.totalAttended} / {overall.totalConducted} classes)
            </span>
          </div>
        </div>

        {/* Conducted & Attended */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-medium">Total Conducted</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {overall.totalConducted}
          </div>
          <div className="text-[10px] text-slate-500">Classes held to date</div>
        </div>

        {/* Attended Total */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-medium">Total Attended</div>
          <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
            {overall.totalAttended}
          </div>
          <div className="text-[10px] text-indigo-400/80">Includes OD &amp; Medical</div>
        </div>
      </div>

      {/* Visual Indicators Strip (PRESENT, OD, MEDICAL, ABSENT) */}
      <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            Visual Indicators:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* PRESENT 🟦 Light Blue */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-sky-400 shadow-sm shadow-sky-500/50 inline-block border border-sky-300 shrink-0" />
            <span className="text-slate-300 font-medium">
              PRESENT: <strong className="text-sky-300 font-mono">{overall.totalRegularPresent}</strong>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">(Val = 1)</span>
          </div>

          {/* OD 🟧 Orange */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-500 shadow-sm shadow-amber-500/50 inline-block border border-amber-400 shrink-0" />
            <span className="text-slate-300 font-medium">
              OD (On Duty): <strong className="text-amber-400 font-mono">{overall.totalOD}</strong>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">(Val = 1)</span>
          </div>

          {/* MEDICAL 🟧 Orange */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-orange-500 shadow-sm shadow-orange-500/50 inline-block border border-orange-400 shrink-0" />
            <span className="text-slate-300 font-medium">
              MEDICAL LEAVE: <strong className="text-orange-400 font-mono">{overall.totalMedical}</strong>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">(Val = 1)</span>
          </div>

          {/* ABSENT 🟥 Red */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 shadow-sm shadow-rose-500/50 inline-block border border-rose-400 shrink-0" />
            <span className="text-slate-300 font-medium">
              ABSENT: <strong className="text-rose-400 font-mono">{overall.totalAbsent}</strong>
            </span>
            <span className="text-[10px] text-rose-400/80 font-mono">(Val = 0)</span>
          </div>
        </div>

        {/* Live recalculation note */}
        <div className="text-[11px] text-slate-400 hidden xl:inline">
          ✨ OD &amp; Medical leaves automatically protect your attendance percentage.
        </div>
      </div>

      {/* Export Bar: Individual & Cohort Downloads */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Student Profile:</span>
          </span>
          <button
            onClick={handleExportStudentCSV}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileText className="w-3 h-3 text-sky-400" />
            <span>Student CSV</span>
          </button>
          <button
            onClick={handleExportStudentXLSX}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
            <span>Student Excel (.xlsx)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Section Summary ({selectedSection.name}):</span>
          </span>
          <button
            onClick={handleExportSectionCSV}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileText className="w-3 h-3 text-sky-400" />
            <span>Section Cohort CSV</span>
          </button>
          <button
            onClick={handleExportSectionXLSX}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
            <span>Section Cohort Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
