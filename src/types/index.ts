export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type AttendanceStatus = 'SAFE' | 'AT_RISK' | 'DETENTION' | 'IRREVERSIBLE_DETENTION';

export type AttendanceMark = 'PRESENT' | 'ABSENT' | 'OD' | 'MEDICAL_LEAVE';

export interface Subject {
  id: string; // e.g., 'A', 'B', 'LAB', 'DLMS', 'B-Proj'
  code: string; // e.g., '21MAB201T'
  name: string; // e.g., 'Transforms and Boundary Value Problems'
  isLab?: boolean;
  isProject?: boolean;
}

export interface TimetableSlot {
  period: number;
  time?: string;
  subjectId: string;
  attendanceCount: boolean;
  isProject?: boolean;
}

export interface SectionTimetable {
  id: string;
  name: string;
  year: string;
  semester: string;
  venue: string;
  department?: string;
  subjects: Record<string, Subject>;
  schedule: Record<DayOfWeek, TimetableSlot[]>;
  isCustomUploaded?: boolean;
}

export interface ClassSessionAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  period: number;
  subjectId: string;
  status: AttendanceMark;
  timestamp: string;
  note?: string;
}

export interface SubjectAttendanceRecord {
  conducted: number;
  attended: number; // Mathematically counted: Present + OD + Medical Leave
  regularPresent?: number;
  odCount?: number;
  medicalCount?: number;
  absentCount?: number;
  sessionLogs?: ClassSessionAttendance[];
}

export interface Student {
  id: string;
  name: string;
  regNo: string;
  department: string;
  year: string;
  section: string;
  email?: string;
  attendanceData?: Record<string, SubjectAttendanceRecord>;
  historicalPercentage?: number;
}

export interface CustomTimetablePackage {
  id: string;
  filename: string;
  uploadedAt: string;
  fileType: 'pdf' | 'csv' | 'xlsx' | 'txt';
  sections: SectionTimetable[];
  rawSummary?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickAction?: string;
}

export interface ScheduledClassOccurrence {
  date: string; // YYYY-MM-DD
  day: DayOfWeek;
  period: number;
  time?: string;
  subjectId: string;
}

export interface SubjectPrediction {
  subjectId: string;
  subject: Subject;
  conducted: number;
  attended: number;
  regularPresent: number;
  odCount: number;
  medicalCount: number;
  absentCount: number;
  currentPercentage: number | null; // null if conducted === 0
  remainingClasses: number;
  totalClassesAtEnd: number; // conducted + remainingClasses
  requiredFor90: number | null; // smallest X >= 0 to achieve >= 90%, null if impossible
  is90Possible: boolean;
  maxClassesMissable90: number; // classes that can be missed while staying >= 90%
  requiredFor75: number | null; // smallest X >= 0 to achieve >= 75%, null if impossible
  is75Possible: boolean;
  maxPossiblePercentage: number;
  status: AttendanceStatus;
  occurrences: ScheduledClassOccurrence[];
}

export interface OverallPrediction {
  totalConducted: number;
  totalAttended: number; // Present + OD + Medical Leave
  totalRegularPresent: number;
  totalOD: number;
  totalMedical: number;
  totalAbsent: number;
  overallPercentage: number | null; // null if totalConducted === 0
  totalRemainingClasses: number;
  subjectsBelow90Count: number;
  subjectsBelow75Count: number;
  irreversibleDetentionCount: number;
  overallStatus: AttendanceStatus;
  predictions: SubjectPrediction[];
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  description?: string;
}

