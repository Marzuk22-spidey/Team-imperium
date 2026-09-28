import * as XLSX from 'xlsx';
import { SectionTimetable, DayOfWeek } from '../types';
import { PERIOD_TIMINGS } from '../data/timetables';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface TimetableExportRow {
  Section: string;
  Department: string;
  Year: string;
  Semester: string;
  Venue: string;
  Day: string;
  Period: number;
  Time: string;
  Subject: string;
  'Subject Code': string;
  Type: string;
}

/**
 * Builds array of structured rows from a SectionTimetable
 */
export function buildTimetableExportData(section: SectionTimetable): TimetableExportRow[] {
  const rows: TimetableExportRow[] = [];

  DAYS.forEach((day) => {
    const slots = section.schedule[day] || [];
    slots.forEach((slot) => {
      const subject = section.subjects[slot.subjectId];
      const type = slot.isProject
        ? 'Project'
        : subject?.isLab || slot.subjectId.includes('LAB')
        ? 'Laboratory'
        : 'Lecture';

      rows.push({
        Section: section.name,
        Department: section.department || section.name,
        Year: section.year,
        Semester: section.semester,
        Venue: section.venue || 'Main Block',
        Day: day,
        Period: slot.period,
        Time: slot.time || PERIOD_TIMINGS[slot.period] || `Period ${slot.period}`,
        Subject: subject?.name || slot.subjectId,
        'Subject Code': subject?.code || slot.subjectId,
        Type: type,
      });
    });
  });

  return rows;
}

/**
 * Downloads a genuine CSV file of the section timetable
 */
export function downloadTimetableCSV(section: SectionTimetable) {
  const rows = buildTimetableExportData(section);
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]) as (keyof TimetableExportRow)[];
  const csvLines: string[] = [];

  // Header line
  csvLines.push(headers.map((h) => `"${h}"`).join(','));

  // Data lines
  rows.forEach((row) => {
    const line = headers
      .map((header) => {
        const val = String(row[header] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',');
    csvLines.push(line);
  });

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${section.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_timetable.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a genuine .xlsx Excel spreadsheet of the section timetable
 */
export function downloadTimetableXLSX(section: SectionTimetable) {
  const rows = buildTimetableExportData(section);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Section
    { wch: 18 }, // Department
    { wch: 10 }, // Year
    { wch: 14 }, // Semester
    { wch: 25 }, // Venue
    { wch: 12 }, // Day
    { wch: 8 },  // Period
    { wch: 16 }, // Time
    { wch: 35 }, // Subject
    { wch: 16 }, // Subject Code
    { wch: 14 }, // Type
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

  // Trigger download
  XLSX.writeFile(
    workbook,
    `${section.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_timetable.xlsx`
  );
}
