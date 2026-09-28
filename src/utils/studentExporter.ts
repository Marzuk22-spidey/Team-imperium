import * as XLSX from 'xlsx';
import { Student, SectionTimetable, SubjectPrediction, OverallPrediction } from '../types';

/**
 * Downloads a string as a CSV file in the browser.
 */
function downloadCSVFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads an XLSX workbook in the browser.
 */
function downloadXLSXFile(filename: string, wb: XLSX.WorkBook) {
  XLSX.writeFile(wb, filename);
}

/**
 * Export Single Student Profile as CSV
 */
export function exportSingleStudentCSV(
  student: Student | { name: string; regNo: string; section: string; department?: string; year?: string },
  overall: OverallPrediction,
  predictions: SubjectPrediction[],
  section: SectionTimetable
) {
  const lines: string[] = [];
  lines.push(`"SRM Attendance Predictor - Individual Student Profile"`);
  lines.push(`"Student Name","${student.name}"`);
  lines.push(`"Register Number","${student.regNo}"`);
  lines.push(`"Section","${student.section || section.name}"`);
  lines.push(`"Department","${student.department || section.department || 'N/A'}"`);
  lines.push(`"Overall Attendance","${overall.overallPercentage !== null ? overall.overallPercentage.toFixed(2) + '%' : '0%'}"`);
  lines.push(`"Overall Risk Status","${overall.overallStatus}"`);
  lines.push(`"Total Conducted","${overall.totalConducted}"`);
  lines.push(`"Total Attended (Present + OD + Medical)","${overall.totalAttended}"`);
  lines.push(`"Regular Present","${overall.totalRegularPresent}"`);
  lines.push(`"On Duty (OD)","${overall.totalOD}"`);
  lines.push(`"Medical Leave","${overall.totalMedical}"`);
  lines.push(`"Total Absent","${overall.totalAbsent}"`);
  lines.push(`"Total Remaining Scheduled Classes","${overall.totalRemainingClasses}"`);
  lines.push(``);
  lines.push(`"Subject ID","Subject Code","Subject Name","Type","Conducted","Attended","Present","OD","Medical","Absent","Current %","Remaining","Need for 90%","Need for 75%","Max Possible %","Status"`);

  predictions.forEach((p) => {
    const isLab = p.subject.isLab ? 'Lab' : p.subject.isProject ? 'Project' : 'Theory';
    const currPct = p.currentPercentage !== null ? `${p.currentPercentage.toFixed(1)}%` : 'N/A';
    const req90 = p.requiredFor90 !== null ? (p.requiredFor90 === 0 ? 'Goal Met' : p.requiredFor90) : 'Impossible';
    const req75 = p.requiredFor75 !== null ? (p.requiredFor75 === 0 ? 'Safe' : p.requiredFor75) : 'Impossible (Irreversible)';
    lines.push(
      `"${p.subjectId}","${p.subject.code}","${p.subject.name.replace(/"/g, '""')}","${isLab}",${p.conducted},${p.attended},${p.regularPresent},${p.odCount},${p.medicalCount},${p.absentCount},"${currPct}",${p.remainingClasses},"${req90}","${req75}","${p.maxPossiblePercentage.toFixed(1)}%","${p.status}"`
    );
  });

  const filename = `${student.regNo || 'student'}_attendance_profile.csv`;
  downloadCSVFile(filename, lines.join('\n'));
}

/**
 * Export Single Student Profile as Excel XLSX
 */
export function exportSingleStudentXLSX(
  student: Student | { name: string; regNo: string; section: string; department?: string; year?: string },
  overall: OverallPrediction,
  predictions: SubjectPrediction[],
  section: SectionTimetable
) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Student Name', student.name],
    ['Register Number', student.regNo],
    ['Section', student.section || section.name],
    ['Department', student.department || section.department || 'N/A'],
    ['Overall Attendance %', overall.overallPercentage !== null ? overall.overallPercentage : 0],
    ['Overall Status', overall.overallStatus],
    ['Total Classes Conducted', overall.totalConducted],
    ['Total Classes Attended', overall.totalAttended],
    ['Regular Present', overall.totalRegularPresent],
    ['On Duty (OD)', overall.totalOD],
    ['Medical Leave', overall.totalMedical],
    ['Total Absent', overall.totalAbsent],
    ['Total Remaining Classes', overall.totalRemainingClasses],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Student Summary');

  // Subjects Sheet
  const subjectRows = predictions.map((p) => ({
    'Subject ID': p.subjectId,
    'Subject Code': p.subject.code,
    'Subject Name': p.subject.name,
    'Type': p.subject.isLab ? 'Lab' : p.subject.isProject ? 'Project' : 'Theory',
    'Conducted': p.conducted,
    'Attended': p.attended,
    'Present': p.regularPresent,
    'OD': p.odCount,
    'Medical': p.medicalCount,
    'Absent': p.absentCount,
    'Current %': p.currentPercentage !== null ? p.currentPercentage : 'N/A',
    'Remaining Classes': p.remainingClasses,
    'Classes Needed for 90%': p.requiredFor90 !== null ? p.requiredFor90 : 'Impossible',
    'Classes Needed for 75%': p.requiredFor75 !== null ? p.requiredFor75 : 'Impossible',
    'Max Possible %': p.maxPossiblePercentage,
    'Status': p.status,
  }));
  const subjectsSheet = XLSX.utils.json_to_sheet(subjectRows);
  XLSX.utils.book_append_sheet(wb, subjectsSheet, 'Subject Breakdown');

  const filename = `${student.regNo || 'student'}_attendance_profile.xlsx`;
  downloadXLSXFile(filename, wb);
}

/**
 * Export Entire Section Summary as CSV
 */
export function exportSectionSummaryCSV(
  section: SectionTimetable,
  students: Student[],
  defaultSubjects: Record<string, any>
) {
  const lines: string[] = [];
  lines.push(`"SRM Attendance Predictor - Section Cohort Summary"`);
  lines.push(`"Section","${section.name}"`);
  lines.push(`"Department","${section.department || 'N/A'}"`);
  lines.push(`"Year / Semester","${section.year} - ${section.semester}"`);
  lines.push(`"Total Enrolled Students",${students.length}`);
  lines.push(``);
  lines.push(
    `"Reg No","Student Name","Section","Department","Total Conducted","Total Attended","Present","OD","Medical","Absent","Attendance %","Detention Warning (<75%)","Irreversible Risk","Status"`
  );

  students.forEach((st) => {
    // If student has historical or specific attendance data
    let conducted = 0;
    let attended = 0;
    let present = 0;
    let od = 0;
    let medical = 0;
    let absent = 0;

    if (st.attendanceData) {
      Object.values(st.attendanceData).forEach((rec) => {
        conducted += rec.conducted || 0;
        attended += rec.attended || 0;
        present += rec.regularPresent || 0;
        od += rec.odCount || 0;
        medical += rec.medicalCount || 0;
        absent += rec.absentCount || 0;
      });
    } else if (st.historicalPercentage !== undefined) {
      conducted = 60;
      attended = Math.round((st.historicalPercentage / 100) * conducted);
      present = attended;
      absent = conducted - attended;
    }

    const pct = conducted > 0 ? (attended / conducted) * 100 : (st.historicalPercentage ?? 0);
    const isDetention = pct < 75;
    const isIrreversible = pct < 50; // heuristic when remaining classes unknown
    let status = 'SAFE';
    if (pct < 50) status = 'IRREVERSIBLE_DETENTION';
    else if (pct < 75) status = 'DETENTION';
    else if (pct < 90) status = 'AT_RISK';

    lines.push(
      `"${st.regNo}","${st.name.replace(/"/g, '""')}","${st.section}","${st.department}",${conducted},${attended},${present},${od},${medical},${absent},"${pct.toFixed(1)}%","${isDetention ? 'YES - DETENTION RISK' : 'NO'}","${isIrreversible ? 'CRITICAL' : 'RECOVERABLE'}","${status}"`
    );
  });

  const filename = `${section.id}_cohort_attendance_summary.csv`;
  downloadCSVFile(filename, lines.join('\n'));
}

/**
 * Export Entire Section Summary as Excel XLSX
 */
export function exportSectionSummaryXLSX(
  section: SectionTimetable,
  students: Student[],
  defaultSubjects: Record<string, any>
) {
  const wb = XLSX.utils.book_new();

  const rows = students.map((st) => {
    let conducted = 0;
    let attended = 0;
    let present = 0;
    let od = 0;
    let medical = 0;
    let absent = 0;

    if (st.attendanceData) {
      Object.values(st.attendanceData).forEach((rec) => {
        conducted += rec.conducted || 0;
        attended += rec.attended || 0;
        present += rec.regularPresent || 0;
        od += rec.odCount || 0;
        medical += rec.medicalCount || 0;
        absent += rec.absentCount || 0;
      });
    } else if (st.historicalPercentage !== undefined) {
      conducted = 60;
      attended = Math.round((st.historicalPercentage / 100) * conducted);
      present = attended;
      absent = conducted - attended;
    }

    const pct = conducted > 0 ? Number(((attended / conducted) * 100).toFixed(1)) : (st.historicalPercentage ?? 0);
    const isDetention = pct < 75;
    let status = 'SAFE';
    if (pct < 50) status = 'IRREVERSIBLE_DETENTION';
    else if (pct < 75) status = 'DETENTION';
    else if (pct < 90) status = 'AT_RISK';

    return {
      'Register Number': st.regNo,
      'Student Name': st.name,
      'Section': st.section,
      'Department': st.department,
      'Conducted': conducted,
      'Attended': attended,
      'Present': present,
      'On Duty (OD)': od,
      'Medical Leave': medical,
      'Absent': absent,
      'Attendance %': pct,
      'Detention Warning (<75%)': isDetention ? 'FLAGGED' : 'CLEAR',
      'Status': status,
    };
  });

  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, sheet, `${section.name.substring(0, 31)} Cohort`);

  const filename = `${section.id}_cohort_attendance_summary.xlsx`;
  downloadXLSXFile(filename, wb);
}
