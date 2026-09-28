import React, { useState, useMemo, useEffect } from 'react';
import { TIMETABLES, PERIOD_TIMINGS } from './data/timetables';
import { DEFAULT_HOLIDAYS } from './data/holidays';
import { INITIAL_STUDENTS } from './data/defaultStudents';
import {
  DayOfWeek,
  Holiday,
  SectionTimetable,
  Subject,
  SubjectAttendanceRecord,
  SubjectPrediction,
  TimetableSlot,
  CustomTimetablePackage,
  Student,
  AttendanceMark,
} from './types';
import {
  SEMESTER_START,
  SEMESTER_END,
  getEffectiveStartDate,
  getDaysBetween,
  formatReadableDate,
  formatDateWithDay,
} from './utils/dateUtils';
import {
  getClassesBetweenDates,
  calculateSubjectPrediction,
  calculateOverallPrediction,
} from './utils/calculationEngine';

import { Header } from './components/Header';
import { IrreversibleDetentionBanner } from './components/IrreversibleDetentionBanner';
import { TimetableManagementBar } from './components/TimetableManagementBar';
import { SectionSelector } from './components/SectionSelector';
import { StudentProfileCard } from './components/StudentProfileCard';
import { PlanningDateSelector } from './components/PlanningDateSelector';
import { AttendanceInputs } from './components/AttendanceInputs';
import { OverallDashboard } from './components/OverallDashboard';
import { SubjectTable } from './components/SubjectTable';
import { TimetableAttendanceMonitor } from './components/TimetableAttendanceMonitor';
import { WhatIfPlanner } from './components/WhatIfPlanner';
import { AttendanceReport } from './components/AttendanceReport';
import { TimetableModal } from './components/TimetableModal';
import { TimetableUploadModal } from './components/TimetableUploadModal';
import { StudentRosterModal } from './components/StudentRosterModal';
import { HolidayModal } from './components/HolidayModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AIAttendanceChatbot } from './components/AIAttendanceChatbot';
import { Footer } from './components/Footer';

import {
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function App() {
  // Available sections list (starts with official 10 SRM timetables, can be expanded/replaced by AI upload)
  const [availableSections, setAvailableSections] = useState<SectionTimetable[]>(TIMETABLES);

  // Active section selection
  const [selectedSection, setSelectedSection] = useState<SectionTimetable>(TIMETABLES[0]);

  // Active custom uploaded timetable package
  const [activeCustomPackage, setActiveCustomPackage] = useState<CustomTimetablePackage | null>(null);

  // Student roster state (initialized with real SRM student records)
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  // Active student selection (null = self-guided manual entry)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Date simulation state (null means use real device/browser date)
  const [simulatedDate, setSimulatedDate] = useState<string | null>(null);

  // Planning date (default: 2026-11-29)
  const [planUntilDateStr, setPlanUntilDateStr] = useState<string>(SEMESTER_END);

  // Holidays state
  const [holidays, setHolidays] = useState<Holiday[]>(DEFAULT_HOLIDAYS);

  // B-Proj project slot attendance inclusion toggle
  const [includeProjectSlots, setIncludeProjectSlots] = useState<boolean>(true);

  // Modals state
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isTimetableUploadModalOpen, setIsTimetableUploadModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  // Toast notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'monitor' | 'planner' | 'report' | 'schedule'
  >('calculator');

  // Attendance Records: Record<subjectId, { conducted, attended, regularPresent, odCount, medicalCount, absentCount }>
  const [attendanceData, setAttendanceData] = useState<
    Record<string, SubjectAttendanceRecord>
  >({});

  // Flag if demo mode was loaded
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Effective today date calculations
  const { effectiveDate, isBeforeSemester, isAfterSemester } = useMemo(
    () => getEffectiveStartDate(simulatedDate || undefined),
    [simulatedDate]
  );

  const daysRemaining = useMemo(
    () => getDaysBetween(effectiveDate, planUntilDateStr),
    [effectiveDate, planUntilDateStr]
  );

  // Calendar class count calculation based on actual timetable and dates
  const calendarClassCount = useMemo(() => {
    return getClassesBetweenDates(
      selectedSection,
      effectiveDate,
      planUntilDateStr,
      holidays,
      includeProjectSlots
    );
  }, [
    selectedSection,
    effectiveDate,
    planUntilDateStr,
    holidays,
    includeProjectSlots,
  ]);

  // Subject predictions
  const subjectPredictions: SubjectPrediction[] = useMemo(() => {
    const subjects = selectedSection.subjects;
    return Object.values(subjects).map((sub) => {
      const rec = attendanceData[sub.id] || { conducted: 0, attended: 0 };
      const remaining = calendarClassCount.subjectCounts[sub.id] || 0;
      const occurrences = calendarClassCount.occurrences[sub.id] || [];
      return calculateSubjectPrediction(
        sub,
        rec.conducted,
        rec.attended,
        remaining,
        occurrences,
        rec.odCount || 0,
        rec.medicalCount || 0,
        rec.absentCount
      );
    });
  }, [selectedSection, attendanceData, calendarClassCount]);

  // Overall aggregate prediction
  const overallPrediction = useMemo(() => {
    return calculateOverallPrediction(subjectPredictions);
  }, [subjectPredictions]);

  // Irreversible detention subjects
  const irreversibleSubjects = useMemo(() => {
    return subjectPredictions.filter(
      (p) => p.conducted > 0 && p.status === 'IRREVERSIBLE_DETENTION'
    );
  }, [subjectPredictions]);

  const hasAttendanceRecorded = useMemo(() => {
    return subjectPredictions.some((p) => p.conducted > 0);
  }, [subjectPredictions]);

  // Trigger notification toast
  const triggerNotification = (message: string) => {
    setToastMessage(message);
  };

  // Section Change Handler
  const handleSectionChange = (section: SectionTimetable) => {
    setSelectedSection(section);
    setSelectedStudent(null);
    setAttendanceData({});
    setIsDemoActive(false);
  };

  // Student selection handler (auto-fills attendance data)
  const handleSelectStudent = (student: Student | null) => {
    setSelectedStudent(student);

    if (!student) {
      // Returned to self-guided manual entry
      triggerNotification('Switched to self-guided manual attendance entry.');
      return;
    }

    // Auto-fill student attendance
    if (student.attendanceData && Object.keys(student.attendanceData).length > 0) {
      setAttendanceData(student.attendanceData);
      setIsDemoActive(false);
      triggerNotification(`Loaded verified attendance profile for ${student.name} (${student.regNo}).`);
    } else if (student.historicalPercentage !== undefined) {
      // Synthesize realistic subject attendance matching historical percentage for active subjects
      const subKeys = Object.keys(selectedSection.subjects);
      const generated: Record<string, SubjectAttendanceRecord> = {};
      const pct = student.historicalPercentage;

      subKeys.forEach((key, idx) => {
        const conducted = 28 + (idx % 3) * 2;
        const attended = Math.round((pct / 100) * conducted);
        const od = idx % 2 === 0 ? 1 : 0;
        const med = idx === 1 ? 1 : 0;
        const regPresent = Math.max(0, attended - od - med);
        const absent = Math.max(0, conducted - attended);

        generated[key] = {
          conducted,
          attended,
          regularPresent: regPresent,
          odCount: od,
          medicalCount: med,
          absentCount: absent,
        };
      });

      setAttendanceData(generated);
      setIsDemoActive(false);
      triggerNotification(`Loaded ${student.name}'s attendance record (${pct.toFixed(1)}%).`);
    } else {
      triggerNotification(`Selected ${student.name}. Enter subject attendance to predict outcome.`);
    }
  };

  // AI Timetable Processed Handler
  const handleTimetableProcessed = (pkg: CustomTimetablePackage) => {
    setActiveCustomPackage(pkg);
    // Combine custom uploaded sections with default sections, prioritizing custom
    const customSections = pkg.sections;
    setAvailableSections([...customSections, ...TIMETABLES]);

    if (customSections.length > 0) {
      const firstSec = customSections[0];
      setSelectedSection(firstSec);
      setSelectedStudent(null);
      setAttendanceData({});
      setIsDemoActive(false);
      triggerNotification(
        `AI extracted ${customSections.length} section(s) from "${pkg.filename}". Active section: ${firstSec.name}`
      );
    }
    setIsTimetableUploadModalOpen(false);
  };

  // Replace timetable handler
  const handleReplaceCustomTimetable = () => {
    setIsTimetableUploadModalOpen(true);
  };

  // Delete timetable handler
  const handleDeleteCustomTimetable = () => {
    setActiveCustomPackage(null);
    setAvailableSections(TIMETABLES);
    setSelectedSection(TIMETABLES[0]);
    setAttendanceData({});
    setIsDemoActive(false);
    triggerNotification('Custom timetable removed. Restored standard SRM timetables.');
  };

  // Student roster updated handler
  const handleStudentsUpdated = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    triggerNotification(`Student roster updated with ${updatedStudents.length} records.`);
  };

  // Attendance manual change handler
  const handleAttendanceChange = (
    subjectId: string,
    field: 'conducted' | 'attended',
    value: number
  ) => {
    setAttendanceData((prev) => {
      const current = prev[subjectId] || { conducted: 0, attended: 0, odCount: 0, medicalCount: 0 };
      const updated = { ...current };

      if (field === 'conducted') {
        updated.conducted = Math.max(0, value);
        if (updated.attended > updated.conducted) {
          updated.attended = updated.conducted;
        }
      } else {
        updated.attended = Math.min(updated.conducted, Math.max(0, value));
      }

      // Recalculate breakdown
      const od = updated.odCount || 0;
      const med = updated.medicalCount || 0;
      updated.regularPresent = Math.max(0, updated.attended - od - med);
      updated.absentCount = Math.max(0, updated.conducted - updated.attended);

      return {
        ...prev,
        [subjectId]: updated,
      };
    });
  };

  // Detailed attendance change (with OD & Medical counts)
  const handleDetailedAttendanceChange = (
    subjectId: string,
    regularPresent: number,
    odCount: number,
    medicalCount: number,
    conducted: number
  ) => {
    setAttendanceData((prev) => {
      const attended = Math.min(conducted, regularPresent + odCount + medicalCount);
      const absentCount = Math.max(0, conducted - attended);

      return {
        ...prev,
        [subjectId]: {
          conducted,
          attended,
          regularPresent,
          odCount,
          medicalCount,
          absentCount,
        },
      };
    });
  };

  // Mark attendance on specific timetable slot
  const handleMarkSlotAttendance = (
    subjectId: string,
    mark: AttendanceMark,
    delta: number,
    reason?: string
  ) => {
    setAttendanceData((prev) => {
      const cur = prev[subjectId] || { conducted: 0, attended: 0, odCount: 0, medicalCount: 0, regularPresent: 0, absentCount: 0 };
      const conducted = cur.conducted + (delta > 0 ? 1 : 0);
      let odCount = cur.odCount || 0;
      let medicalCount = cur.medicalCount || 0;
      let regularPresent = cur.regularPresent || 0;
      let absentCount = cur.absentCount || 0;

      if (mark === 'PRESENT') {
        regularPresent += 1;
      } else if (mark === 'OD') {
        odCount += 1;
      } else if (mark === 'MEDICAL_LEAVE') {
        medicalCount += 1;
      } else if (mark === 'ABSENT') {
        absentCount += 1;
      }

      const attended = regularPresent + odCount + medicalCount;

      return {
        ...prev,
        [subjectId]: {
          conducted,
          attended,
          regularPresent,
          odCount,
          medicalCount,
          absentCount,
        },
      };
    });
  };

  // Add Subject to selected section and weekly timetable schedule
  const handleAddSubject = (
    newSubject: Subject,
    slots: { day: DayOfWeek; period: number }[],
    conducted: number,
    attended: number,
    odCount: number,
    medicalCount: number
  ) => {
    // 1. Update selectedSection with the new subject and weekly schedule slots
    setSelectedSection((prevSec) => {
      const updatedSubjects = {
        ...prevSec.subjects,
        [newSubject.id]: newSubject,
      };

      const updatedSchedule = { ...prevSec.schedule };
      slots.forEach(({ day, period }) => {
        const existingSlots = updatedSchedule[day] ? [...updatedSchedule[day]] : [];
        existingSlots.push({
          period,
          time: PERIOD_TIMINGS[period] || '09:00 - 09:50',
          subjectId: newSubject.id,
          attendanceCount: true,
          isProject: newSubject.isProject,
        });
        existingSlots.sort((a, b) => a.period - b.period);
        updatedSchedule[day] = existingSlots;
      });

      return {
        ...prevSec,
        subjects: updatedSubjects,
        schedule: updatedSchedule,
      };
    });

    // 2. Also keep availableSections updated with the new subject and slots
    setAvailableSections((prevList) =>
      prevList.map((sec) => {
        if (sec.id === selectedSection.id) {
          const updatedSubjects = { ...sec.subjects, [newSubject.id]: newSubject };
          const updatedSchedule = { ...sec.schedule };
          slots.forEach(({ day, period }) => {
            const existingSlots = updatedSchedule[day] ? [...updatedSchedule[day]] : [];
            existingSlots.push({
              period,
              time: PERIOD_TIMINGS[period] || '09:00 - 09:50',
              subjectId: newSubject.id,
              attendanceCount: true,
              isProject: newSubject.isProject,
            });
            existingSlots.sort((a, b) => a.period - b.period);
            updatedSchedule[day] = existingSlots;
          });
          return {
            ...sec,
            subjects: updatedSubjects,
            schedule: updatedSchedule,
          };
        }
        return sec;
      })
    );

    // 3. Update attendanceData for the newly added subject
    setAttendanceData((prev) => {
      const regularPresent = Math.max(0, attended - odCount - medicalCount);
      const absentCount = Math.max(0, conducted - attended);
      return {
        ...prev,
        [newSubject.id]: {
          conducted,
          attended,
          regularPresent,
          odCount,
          medicalCount,
          absentCount,
        },
      };
    });

    triggerNotification(
      `Added "${newSubject.name}" (${newSubject.code}) with ${slots.length} period(s). Now active in Timetable Monitor!`
    );
  };

  const handleSetAllConducted = (conductedVal: number) => {
    setAttendanceData((prev) => {
      const next: Record<string, SubjectAttendanceRecord> = {};
      Object.keys(selectedSection.subjects).forEach((id) => {
        const cur = prev[id] || { conducted: 0, attended: 0 };
        const attended = Math.min(conductedVal, cur.attended);
        next[id] = {
          conducted: conductedVal,
          attended,
          regularPresent: attended,
          odCount: 0,
          medicalCount: 0,
          absentCount: Math.max(0, conductedVal - attended),
        };
      });
      return next;
    });
  };

  const handleClearAll = () => {
    setAttendanceData({});
    setIsDemoActive(false);
    setSelectedStudent(null);
    triggerNotification('Attendance data reset.');
  };

  // Demo scenarios loader
  const handleLoadDemoScenario = (
    scenarioType: 'mixed' | 'safe' | 'at_risk' | 'detention' | 'irreversible'
  ) => {
    setIsDemoActive(true);
    const subKeys = Object.keys(selectedSection.subjects);
    const demoData: Record<string, SubjectAttendanceRecord> = {};

    subKeys.forEach((key, idx) => {
      if (scenarioType === 'safe') {
        demoData[key] = {
          conducted: 30,
          attended: 28,
          regularPresent: 26,
          odCount: 2,
          medicalCount: 0,
          absentCount: 2,
        };
      } else if (scenarioType === 'at_risk') {
        demoData[key] = {
          conducted: 30,
          attended: 25,
          regularPresent: 23,
          odCount: 1,
          medicalCount: 1,
          absentCount: 5,
        };
      } else if (scenarioType === 'detention') {
        demoData[key] = {
          conducted: 25,
          attended: 16,
          regularPresent: 14,
          odCount: 2,
          medicalCount: 0,
          absentCount: 9,
        };
      } else if (scenarioType === 'irreversible') {
        demoData[key] = {
          conducted: 40,
          attended: 17,
          regularPresent: 15,
          odCount: 1,
          medicalCount: 1,
          absentCount: 23,
        };
      } else {
        // Mixed realistic scenario
        if (idx === 0) {
          demoData[key] = { conducted: 28, attended: 26, regularPresent: 24, odCount: 2, medicalCount: 0, absentCount: 2 };
        } else if (idx === 1) {
          demoData[key] = { conducted: 26, attended: 22, regularPresent: 20, odCount: 1, medicalCount: 1, absentCount: 4 };
        } else if (idx === 2) {
          demoData[key] = { conducted: 24, attended: 16, regularPresent: 15, odCount: 1, medicalCount: 0, absentCount: 8 };
        } else if (idx === 3) {
          demoData[key] = { conducted: 38, attended: 16, regularPresent: 14, odCount: 2, medicalCount: 0, absentCount: 22 };
        } else {
          demoData[key] = { conducted: 25, attended: 23, regularPresent: 22, odCount: 1, medicalCount: 0, absentCount: 2 };
        }
      }
    });

    setAttendanceData(demoData);
    triggerNotification(`Loaded "${scenarioType.toUpperCase().replace('_', ' ')}" demo scenario.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md">
          <div className="p-3 bg-indigo-950/95 border border-indigo-500 text-indigo-200 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:text-white text-indigo-400 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        selectedSection={selectedSection}
        selectedStudent={selectedStudent}
        todayDateStr={formatReadableDate(effectiveDate)}
        planUntilDateStr={formatReadableDate(planUntilDateStr)}
        daysRemaining={daysRemaining}
        studentsCount={students.length}
        onOpenTimetable={() => setIsTimetableModalOpen(true)}
        onOpenHolidays={() => setIsHolidayModalOpen(true)}
        onOpenRoster={() => setIsRosterModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Irreversible Detention Alert Banner (Always visible when triggered) */}
        <IrreversibleDetentionBanner
          irreversibleSubjects={irreversibleSubjects}
          overallIrreversible={
            overallPrediction.overallStatus === 'IRREVERSIBLE_DETENTION'
          }
          overallAttendance={overallPrediction.overallPercentage}
          overallMaxPossible={
            overallPrediction.totalConducted + overallPrediction.totalRemainingClasses > 0
              ? ((overallPrediction.totalAttended + overallPrediction.totalRemainingClasses) /
                  (overallPrediction.totalConducted + overallPrediction.totalRemainingClasses)) *
                100
              : null
          }
          totalRemainingClasses={overallPrediction.totalRemainingClasses}
        />

        {/* Tab 1: Attendance Calculator & Forecast */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Timetable Management Area */}
            <TimetableManagementBar
              currentSection={selectedSection}
              activeCustomPackage={activeCustomPackage}
              onOpenUploadModal={() => setIsTimetableUploadModalOpen(true)}
              onOpenViewModal={() => setIsTimetableModalOpen(true)}
              onDeleteCustomTimetable={handleDeleteCustomTimetable}
              onReplaceCustomTimetable={handleReplaceCustomTimetable}
            />

            {/* Step 1: Select Section */}
            <SectionSelector
              sections={availableSections}
              selectedSection={selectedSection}
              onSelectSection={handleSectionChange}
              onViewTimetable={() => setIsTimetableModalOpen(true)}
            />

            {/* Student Profile & Selector Card (Auto-fill attendance, individual predictions, export) */}
            <StudentProfileCard
              students={students}
              selectedStudent={selectedStudent}
              onSelectStudent={handleSelectStudent}
              selectedSection={selectedSection}
              overall={overallPrediction}
              predictions={subjectPredictions}
              onOpenRosterModal={() => setIsRosterModalOpen(true)}
            />

            {/* Step 2: Planning Date */}
            <PlanningDateSelector
              todayDateStr={effectiveDate}
              effectiveStartDateStr={effectiveDate}
              planUntilDateStr={planUntilDateStr}
              onPlanUntilChange={setPlanUntilDateStr}
              daysRemaining={daysRemaining}
              totalScheduledClasses={calendarClassCount.totalScheduledSlots}
              isBeforeSemester={isBeforeSemester}
              isAfterSemester={isAfterSemester}
              simulatedDate={simulatedDate}
              onSimulatedDateChange={setSimulatedDate}
            />

            {/* Step 3: Enter Attendance */}
            <AttendanceInputs
              subjects={selectedSection.subjects}
              attendanceData={attendanceData}
              onAttendanceChange={handleAttendanceChange}
              onDetailedAttendanceChange={handleDetailedAttendanceChange}
              onSetAllConducted={handleSetAllConducted}
              onLoadDemoScenario={handleLoadDemoScenario}
              onClearAll={handleClearAll}
              onNotification={triggerNotification}
              isDemoActive={isDemoActive}
              onOpenAddSubject={() => setIsAddSubjectModalOpen(true)}
            />

            {/* Empty State Prompt if no attendance recorded */}
            {!hasAttendanceRecorded ? (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-slate-800 text-indigo-400 mb-1">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">
                  Select your class and enter your current attendance to begin.
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Type your classes conducted and attended for each subject above, or pick a student from the profile card above to see instant mathematical forecasts, detention warnings, and missable classes.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleLoadDemoScenario('mixed')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Realistic Demo Scenario</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Step 4: Overall Attendance Dashboard */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Step 4
                    </span>
                    <h2 className="text-base font-bold text-white">Overall Attendance Dashboard</h2>
                  </div>
                  <OverallDashboard
                    overall={overallPrediction}
                    hasAttendanceRecorded={hasAttendanceRecorded}
                  />
                </div>

                {/* Step 5: Subject Table */}
                <SubjectTable predictions={subjectPredictions} />
              </>
            )}
          </div>
        )}

        {/* Tab 2: Timetable Monitor & Marking */}
        {activeTab === 'monitor' && (
          <TimetableAttendanceMonitor
            section={selectedSection}
            occurrencesBySubject={calendarClassCount.occurrences}
            onMarkAttendance={handleMarkSlotAttendance}
            onNotification={triggerNotification}
          />
        )}

        {/* Tab 3: "What-If?" Interactive Planner */}
        {activeTab === 'planner' && (
          <WhatIfPlanner predictions={subjectPredictions} />
        )}

        {/* Tab 4: Action Plan Report */}
        {activeTab === 'report' && (
          <AttendanceReport
            overall={overallPrediction}
            selectedSection={selectedSection}
            todayDateStr={effectiveDate}
            planUntilDateStr={planUntilDateStr}
            daysRemaining={daysRemaining}
          />
        )}

        {/* Tab 5: Class Schedule View */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {selectedSection.name} Timetable Overview
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedSection.year} · {selectedSection.semester} · Venue: {selectedSection.venue}
                  </p>
                </div>
                <button
                  onClick={() => setIsTimetableModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Full Screen Schedule
                </button>
              </div>

              {/* Embed timetable */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3 w-32">Day</th>
                      <th className="py-2.5 px-3">Classes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as DayOfWeek[]).map((day) => {
                      const slots: TimetableSlot[] = selectedSection.schedule[day] || [];
                      return (
                        <tr key={day} className="hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-bold text-slate-200">
                            {day}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1.5">
                              {slots.map((s: TimetableSlot, i: number) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300"
                                >
                                  P{s.period}: <strong>{s.subjectId}</strong> ({selectedSection.subjects[s.subjectId]?.code || ''})
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Timetable Upload Modal */}
      <TimetableUploadModal
        isOpen={isTimetableUploadModalOpen}
        onClose={() => setIsTimetableUploadModalOpen(false)}
        onTimetableProcessed={handleTimetableProcessed}
      />

      {/* Student Roster Modal */}
      <StudentRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        students={students}
        onStudentsUpdated={handleStudentsUpdated}
        selectedStudent={selectedStudent}
        onSelectStudent={handleSelectStudent}
      />

      {/* Timetable Modal */}
      <TimetableModal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        section={selectedSection}
        includeProjectSlots={includeProjectSlots}
        onToggleProjectSlots={setIncludeProjectSlots}
      />

      {/* Holidays Modal */}
      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        holidays={holidays}
        onUpdateHolidays={setHolidays}
      />

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        sectionName={selectedSection.name}
        existingSubjectIds={Object.keys(selectedSection.subjects)}
        onAddSubject={handleAddSubject}
      />

      {/* Smart Attendance Assistant Floating AI Chatbot */}
      <AIAttendanceChatbot
        selectedStudent={selectedStudent}
        selectedSection={selectedSection}
        overall={overallPrediction}
        predictions={subjectPredictions}
        effectiveStartDate={effectiveDate}
        planUntilDate={planUntilDateStr}
        daysRemaining={daysRemaining}
      />

      {/* Footer with mandatory attribution */}
      <Footer />
    </div>
  );
}
