import React, { useState, useRef } from 'react';
import { SectionTimetable, CustomTimetablePackage } from '../types';
import { processTimetableFile } from '../utils/timetableParser';
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Layers,
  Calendar,
} from 'lucide-react';

interface TimetableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimetableProcessed: (pkg: CustomTimetablePackage) => void;
}

export const TimetableUploadModal: React.FC<TimetableUploadModalProps> = ({
  isOpen,
  onClose,
  onTimetableProcessed,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [extractedSections, setExtractedSections] = useState<SectionTimetable[] | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      setExtractedSections(null);
    }
  };

  const handleStartProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setExtractedSections(null);

    try {
      const result = await processTimetableFile(selectedFile, (stage) => {
        setProcessingStage(stage);
      });

      if (result.success && result.sections.length > 0) {
        setExtractedSections(result.sections);
        setSummaryMessage(
          result.summary ||
            `Successfully extracted ${result.sections.length} class section(s) with complete weekly schedules.`
        );
      } else {
        setError(result.error || 'Could not confidently understand this timetable.');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not confidently understand this timetable.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleConfirmSave = () => {
    if (!selectedFile || !extractedSections) return;

    let fType: 'pdf' | 'csv' | 'xlsx' | 'txt' = 'txt';
    const name = selectedFile.name.toLowerCase();
    if (name.endsWith('.pdf')) fType = 'pdf';
    else if (name.endsWith('.csv')) fType = 'csv';
    else if (name.endsWith('.xlsx') || name.endsWith('.xls')) fType = 'xlsx';

    const customPkg: CustomTimetablePackage = {
      id: `custom-${Date.now()}`,
      filename: selectedFile.name,
      uploadedAt: new Date().toISOString(),
      fileType: fType,
      sections: extractedSections,
      rawSummary: summaryMessage,
    };

    onTimetableProcessed(customPkg);
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setExtractedSections(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Upload Academic Timetable
              </h2>
              <p className="text-xs text-slate-400">
                AI extraction engine supporting PDF, CSV, XLSX, and TXT files.
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
          {/* File Picker Zone */}
          {!extractedSections && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-indigo-500/60 bg-indigo-950/20'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/60 hover:bg-slate-950'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-indigo-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {selectedFile ? (
                      <span className="text-indigo-300 font-bold">{selectedFile.name}</span>
                    ) : (
                      <span>Click to upload timetable or drag and drop</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Supported: PDF, CSV, XLSX, TXT (Maximum file size: 25 MB)
                  </p>
                </div>
              </div>

              {/* Supported formats info pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono">
                  .PDF (Official SRM Timetable)
                </span>
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono">
                  .CSV (Spreadsheet export)
                </span>
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono">
                  .XLSX (Excel Workbook)
                </span>
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono">
                  .TXT (Text grid)
                </span>
              </div>
            </div>
          )}

          {/* Processing State with Clear Steps */}
          {isProcessing && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Processing Timetable with AI
                </h4>
                <p className="text-xs text-indigo-300 font-medium animate-pulse">
                  {processingStage || 'Analyzing timetable document...'}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 max-w-md mx-auto text-[10px] text-slate-400">
                <div
                  className={`p-1.5 rounded border ${
                    processingStage.includes('Reading')
                      ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-bold'
                      : 'border-slate-800'
                  }`}
                >
                  1. Reading
                </div>
                <div
                  className={`p-1.5 rounded border ${
                    processingStage.includes('Detecting')
                      ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-bold'
                      : 'border-slate-800'
                  }`}
                >
                  2. Sections
                </div>
                <div
                  className={`p-1.5 rounded border ${
                    processingStage.includes('Extracting')
                      ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-bold'
                      : 'border-slate-800'
                  }`}
                >
                  3. Subjects
                </div>
                <div
                  className={`p-1.5 rounded border ${
                    processingStage.includes('Building')
                      ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-bold'
                      : 'border-slate-800'
                  }`}
                >
                  4. Timetable
                </div>
              </div>
            </div>
          )}

          {/* Error Message with Required Buttons */}
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/60 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5 text-rose-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">
                    {error}
                  </strong>
                  <p className="text-slate-300 text-xs mt-1">
                    The document could not be reliably transformed into structured academic sections. Please check the file format or try uploading another document.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleStartProcess}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Upload Another Timetable
                </button>
              </div>
            </div>
          )}

          {/* Review Step: Extracted Sections List */}
          {extractedSections && extractedSections.length > 0 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-white block">Timetable Successfully Extracted</strong>
                  <span>{summaryMessage}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Detected Sections ({extractedSections.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {extractedSections.map((sec) => {
                    const subCount = Object.keys(sec.subjects).length;
                    let totalSlots = 0;
                    Object.values(sec.schedule).forEach((slots) => {
                      totalSlots += slots.length;
                    });

                    return (
                      <div
                        key={sec.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs hover:border-slate-700"
                      >
                        <div>
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span>{sec.name}</span>
                            <span className="text-[10px] text-indigo-400 font-mono">
                              ({sec.year} · {sec.semester})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Venue: {sec.venue || 'Campus Block'} · {sec.department || 'Engineering'}
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono text-[11px] text-slate-300">
                          <div><strong className="text-indigo-400">{subCount}</strong> courses</div>
                          <div className="text-[10px] text-slate-400">{totalSlots} weekly slots</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>

          {!extractedSections ? (
            <button
              onClick={handleStartProcess}
              disabled={!selectedFile || isProcessing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Process with AI</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Upload Different File
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Extracted Timetable</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
