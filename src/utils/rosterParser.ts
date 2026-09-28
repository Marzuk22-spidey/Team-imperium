import { Student } from '../types';
import { readFileData } from './fileExtractors';

export interface ParseRosterResult {
  success: boolean;
  summary?: string;
  students: Student[];
  error?: string;
}

/**
 * Deterministic fallback parser for CSV/TSV student roster
 */
export function parseCSVRosterFallback(csvText: string): Student[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(/,|\t/).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  
  const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('student'));
  const regIdx = headers.findIndex((h) => h.includes('reg') || h.includes('roll') || h.includes('id') || h.includes('number'));
  const deptIdx = headers.findIndex((h) => h.includes('dept') || h.includes('branch'));
  const secIdx = headers.findIndex((h) => h.includes('section') || h.includes('class'));
  const yearIdx = headers.findIndex((h) => h.includes('year'));
  const attIdx = headers.findIndex((h) => h.includes('attendance') || h.includes('percent') || h.includes('%'));

  if (nameIdx === -1 && regIdx === -1) return [];

  const students: Student[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/,|\t/).map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length <= 1) continue;

    const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Student ${i}`;
    const regNo = regIdx !== -1 && cols[regIdx] ? cols[regIdx] : `RA2600000000${i}`;
    const department = deptIdx !== -1 && cols[deptIdx] ? cols[deptIdx] : 'ECE';
    const section = secIdx !== -1 && cols[secIdx] ? cols[secIdx] : 'II ECE DS-A';
    const year = yearIdx !== -1 && cols[yearIdx] ? cols[yearIdx] : 'II Year';
    const rawAtt = attIdx !== -1 && cols[attIdx] ? parseFloat(cols[attIdx].replace('%', '')) : undefined;
    const historicalPercentage = !isNaN(rawAtt as number) ? rawAtt : undefined;

    students.push({
      id: regNo || `stu-${i}`,
      name,
      regNo,
      department,
      year,
      section,
      historicalPercentage,
    });
  }

  return students;
}

/**
 * Main AI & Structured Roster Processing Pipeline
 */
export async function processRosterFile(
  file: File,
  onProgress?: (stage: string) => void
): Promise<ParseRosterResult> {
  onProgress?.('AI is organizing student records...');
  const fileData = await readFileData(file);

  try {
    const res = await fetch('/api/ai/parse-roster', {
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

    if (res.ok) {
      const data = await res.json();
      if (data.students && Array.isArray(data.students) && data.students.length > 0) {
        return {
          success: true,
          summary: data.summary || `Extracted ${data.students.length} student records`,
          students: data.students,
        };
      }
    }
  } catch (err) {
    console.warn('Server AI roster parser error, attempting local fallback:', err);
  }

  if (fileData.fileType === 'csv' || fileData.fileType === 'xlsx' || fileData.fileType === 'txt') {
    const localStudents = parseCSVRosterFallback(fileData.text);
    if (localStudents.length > 0) {
      return {
        success: true,
        summary: `Parsed ${localStudents.length} student records`,
        students: localStudents,
      };
    }
  }

  return {
    success: false,
    error: 'Could not confidently extract student records from this file.',
    students: [],
  };
}
