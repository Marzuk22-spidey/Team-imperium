import React, { useState } from 'react';
import { SectionTimetable, CustomTimetablePackage } from '../types';
import { downloadTimetableCSV, downloadTimetableXLSX } from '../utils/timetableExporter';
import {
  Upload,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface TimetableManagementBarProps {
  currentSection: SectionTimetable;
  activeCustomPackage: CustomTimetablePackage | null;
  onOpenUploadModal: () => void;
  onOpenViewModal: () => void;
  onDeleteCustomTimetable: () => void;
  onReplaceCustomTimetable: () => void;
}

export const TimetableManagementBar: React.FC<TimetableManagementBarProps> = ({
  currentSection,
  activeCustomPackage,
  onOpenUploadModal,
  onOpenViewModal,
  onDeleteCustomTimetable,
  onReplaceCustomTimetable,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const handleDownloadCSV = () => {
    downloadTimetableCSV(currentSection);
  };

  const handleDownloadXLSX = () => {
    downloadTimetableXLSX(currentSection);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
      {/* Top Status Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
              Timetable Management
            </span>
            <span className="text-slate-600">·</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-400">Current Timetable:</span>
            <strong className="text-white">
              {activeCustomPackage ? activeCustomPackage.filename : 'Official SRM University Dataset'}
            </strong>
          </div>

          <span className="text-slate-600 hidden sm:inline">·</span>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-400">Selected Section:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 font-bold font-mono">
              {currentSection.name}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">·</span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            {activeCustomPackage ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>AI Processed ({activeCustomPackage.fileType.toUpperCase()})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Default Dataset Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Upload Action Button */}
        <button
          onClick={onOpenUploadModal}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors self-start md:self-auto cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Timetable (AI)</span>
        </button>
      </div>

      {/* Button Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: View, Replace, Delete */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenViewModal}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>View Timetable</span>
          </button>

          {activeCustomPackage && (
            <>
              <button
                onClick={() => setShowReplaceConfirm(true)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Replace Timetable</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 bg-slate-950 border border-rose-900/60 hover:bg-rose-950/60 text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Timetable</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Export AI-Processed Timetable */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] hidden lg:inline">Export:</span>
          <button
            onClick={handleDownloadCSV}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download real CSV spreadsheet of active timetable"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handleDownloadXLSX}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download real Excel .xlsx spreadsheet of active timetable"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal / Inline dialog */}
      {showDeleteConfirm && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/70 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2 text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Delete this timetable?</strong>
              <span>
                This will remove the uploaded timetable ({activeCustomPackage?.filename}), revert to the default 10 section catalog, and reset section predictions. Student attendance records will NOT be deleted.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-md font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                onDeleteCustomTimetable();
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-bold text-xs cursor-pointer"
            >
              Delete Timetable
            </button>
          </div>
        </div>
      )}

      {/* Replace Confirmation Modal / Inline dialog */}
      {showReplaceConfirm && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/70 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2 text-amber-200">
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Replace current active timetable?</strong>
              <span>
                Uploading a new timetable will replace the existing custom timetable. Your student records will remain preserved.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowReplaceConfirm(false)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-md font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowReplaceConfirm(false);
                onReplaceCustomTimetable();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-bold text-xs cursor-pointer"
            >
              Confirm & Upload New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
