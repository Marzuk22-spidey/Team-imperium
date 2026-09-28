import { SectionTimetable, DayOfWeek, Subject, TimetableSlot } from '../types';
import { PERIOD_TIMINGS } from '../data/timetables';
import { readFileData } from './fileExtractors';

export interface ParseTimetableResult {
  success: boolean;
  confidence?: 'high' | 'medium' | 'low';
  summary?: string;
  sections: SectionTimetable[];
  error?: string;
}

const DAYS_MAP: Record<string, DayOfWeek> = {
  mon: 'Monday',
  monday: 'Monday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  tuesday: 'Tuesday',
  wed: 'Wednesday',
  wednes: 'Wednesday',
  wednesday: 'Wednesday',
  thu: 'Thursday',
  thur: 'Thursday',
  thurs: 'Thursday',
  thursday: 'Thursday',
  fri: 'Friday',
  friday: 'Friday',
  sat: 'Saturday',
  saturday: 'Saturday',
  sun: 'Sunday',
  sunday: 'Sunday',
};

/**
 * Deterministic fallback parser for CSV/TSV timetable files
 */
export function parseCSVTimetableFallback(csvText: string, filename: string): SectionTimetable[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(/,|\t/).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  
  const sectionIdx = headers.findIndex((h) => h.includes('section') || h.includes('class'));
  const dayIdx = headers.findIndex((h) => h.includes('day'));
  const periodIdx = headers.findIndex((h) => h.includes('period') || h.includes('slot') || h.includes('hour'));
  const subjectIdx = headers.findIndex((h) => h.includes('subject') && !h.includes('code'));
  const codeIdx = headers.findIndex((h) => h.includes('code'));
  const venueIdx = headers.findIndex((h) => h.includes('venue') || h.includes('room'));
  const deptIdx = headers.findIndex((h) => h.includes('dept') || h.includes('department'));
  const yearIdx = headers.findIndex((h) => h.includes('year'));
  const semIdx = headers.findIndex((h) => h.includes('sem'));

  if (dayIdx === -1 || (subjectIdx === -1 && codeIdx === -1)) {
    return [];
  }

  const sectionsMap: Record<string, SectionTimetable> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/,|\t/).map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length <= 1) continue;

    const secName = sectionIdx !== -1 && cols[sectionIdx] ? cols[sectionIdx] : filename.replace(/\.[^/.]+$/, '');
    const dayRaw = cols[dayIdx]?.toLowerCase();
    const day = DAYS_MAP[dayRaw] || (dayRaw?.includes('mon') ? 'Monday' : dayRaw?.includes('tue') ? 'Tuesday' : dayRaw?.includes('wed') ? 'Wednesday' : dayRaw?.includes('thu') ? 'Thursday' : dayRaw?.includes('fri') ? 'Friday' : null);

    if (!day) continue;

    const period = periodIdx !== -1 ? parseInt(cols[periodIdx], 10) || 1 : 1;
    const subName = (subjectIdx !== -1 ? cols[subjectIdx] : '') || cols[codeIdx] || 'Subject';
    const subCode = (codeIdx !== -1 ? cols[codeIdx] : '') || subName;
    const venue = venueIdx !== -1 && cols[venueIdx] ? cols[venueIdx] : 'Tech Park';
    const dept = deptIdx !== -1 && cols[deptIdx] ? cols[deptIdx] : 'Engineering';
    const year = yearIdx !== -1 && cols[yearIdx] ? cols[yearIdx] : 'III Year';
    const sem = semIdx !== -1 && cols[semIdx] ? cols[semIdx] : 'V Semester';

    const secId = secName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!sectionsMap[secId]) {
      sectionsMap[secId] = {
        id: secId,
        name: secName,
        year,
        semester: sem,
        venue,
        department: dept,
        subjects: {},
        schedule: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        },
        isCustomUploaded: true,
      };
    }

    const subId = subCode || subName.substring(0, 4).toUpperCase();
    const isLab = subName.toLowerCase().includes('lab') || subCode.toLowerCase().includes('l');
    const isProject = subName.toLowerCase().includes('proj') || subCode.toLowerCase().includes('proj');

    if (!sectionsMap[secId].subjects[subId]) {
      sectionsMap[secId].subjects[subId] = {
        id: subId,
        code: subCode,
        name: subName,
        isLab,
        isProject,
      };
    }

    sectionsMap[secId].schedule[day].push({
      period,
      time: PERIOD_TIMINGS[period] || `P${period}`,
      subjectId: subId,
      attendanceCount: true,
      isProject,
    });
  }

  // Sort slots by period for each day
  Object.values(sectionsMap).forEach((sec) => {
    (Object.keys(sec.schedule) as DayOfWeek[]).forEach((d) => {
      sec.schedule[d].sort((a, b) => a.period - b.period);
    });
  });

  return Object.values(sectionsMap);
}

/**
 * Main AI & Structured Timetable Processing Pipeline
 */
export async function processTimetableFile(
  file: File,
  onProgress?: (stage: string) => void
): Promise<ParseTimetableResult> {
  onProgress?.('Reading timetable...');
  const fileData = await readFileData(file);

  onProgress?.('Detecting sections...');
  
  // Attempt Server AI parsing
  try {
    const res = await fetch('/api/ai/parse-timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileType: fileData.fileType,
        text: fileData.text,
        base64: fileData.base64,
        mimeType: fileData.mimeType,
        filename: file.name,
      }),
    });

    onProgress?.('Extracting subjects and periods...');

    if (res.ok) {
      const data = await res.json();
      onProgress?.('Building timetable...');
      if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
        // Tag as custom uploaded
        const normalizedSections: SectionTimetable[] = data.sections.map((sec: any) => ({
          ...sec,
          isCustomUploaded: true,
          schedule: {
            Monday: sec.schedule?.Monday || [],
            Tuesday: sec.schedule?.Tuesday || [],
            Wednesday: sec.schedule?.Wednesday || [],
            Thursday: sec.schedule?.Thursday || [],
            Friday: sec.schedule?.Friday || [],
            Saturday: sec.schedule?.Saturday || [],
            Sunday: sec.schedule?.Sunday || [],
          },
        }));

        return {
          success: true,
          confidence: data.confidence || 'high',
          summary: data.summary,
          sections: normalizedSections,
        };
      }
    }
  } catch (err) {
    console.warn('Server AI parser failed or unreachable, trying local fallback parser:', err);
  }

  // Fallback to local structured parsing if CSV or text
  if (fileData.fileType === 'csv' || fileData.fileType === 'xlsx' || fileData.fileType === 'txt') {
    onProgress?.('Extracting subjects and periods (Structured Parser)...');
    const localSections = parseCSVTimetableFallback(fileData.text, file.name);
    if (localSections.length > 0) {
      onProgress?.('Building timetable...');
      return {
        success: true,
        confidence: 'medium',
        summary: `Extracted ${localSections.length} section(s) via structured parser`,
        sections: localSections,
      };
    }
  }

  return {
    success: false,
    confidence: 'low',
    error: 'Could not confidently understand this timetable.',
    sections: [],
  };
}
