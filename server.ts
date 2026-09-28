import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Endpoint: Parse Timetable File with Gemini AI
 */
app.post('/api/ai/parse-timetable', async (req: Request, res: Response) => {
  try {
    const { fileType, text, base64, mimeType, filename } = req.body;

    if (!base64 && !text) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const prompt = `You are an expert academic timetable extraction system for university engineering departments (SRM Institute of Science and Technology).
Analyze the uploaded timetable (${filename || 'document'}) and extract structured timetable data for every class section detected.

CRITICAL INSTRUCTIONS:
1. Detect ALL distinct class sections present in the timetable (e.g., "II ECE DS-A", "II ECE DS-B", "III ECE-A", "III ECE-B", "III BME", "1st Year SEEE", etc.).
2. For each section, extract:
   - "id": a slug such as "ii-ece-ds-a"
   - "name": full section name (e.g., "II ECE DS-A")
   - "year": e.g., "II Year", "III Year", "I Year", "IV Year"
   - "semester": e.g., "III Semester", "V Semester", "I Semester", "VII Semester"
   - "department": e.g., "ECE", "BME", "SEEE", etc.
   - "venue": e.g., "Tech Park TP-401" or "EEC-107" or "Basic Sciences Block" (or "Main Block" if unknown)
   - "subjects": a dictionary mapping subject ID (e.g., "A", "B", "C", "LAB", "B-Proj") to:
       {
         "id": "A",
         "code": "21MAB201T",
         "name": "Transforms and Boundary Value Problems",
         "isLab": false,
         "isProject": false
       }
       Identify lab courses ("isLab": true) and project slots ("isProject": true).
   - "schedule": a dictionary of weekdays ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday") containing slots:
       [
         {
           "period": 1,
           "time": "09:00 - 09:50",
           "subjectId": "A",
           "attendanceCount": true,
           "isProject": false
         },
         ...
       ]
3. Standard period mappings if times are not specified:
   P1: 09:00 - 09:50, P2: 09:50 - 10:40, P3: 10:50 - 11:40, P4: 11:40 - 12:30,
   P5: 01:20 - 02:10, P6: 02:10 - 03:00, P7: 03:10 - 04:00, P8: 04:00 - 04:50.
4. Output MUST be ONLY valid JSON matching this schema:
{
  "confidence": "high" | "medium" | "low",
  "summary": "Brief 1-sentence summary of extracted sections and counts",
  "sections": [
     ...SectionTimetable objects...
  ]
}
Do not enclose in markdown ticks if possible, or if enclosed in \`\`\`json, ensure it parses as strict JSON.
If you cannot confidently understand the timetable, set confidence to "low" and provide a helpful message in "summary".`;

    const contents: any[] = [];

    if (fileType === 'pdf' && base64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'application/pdf',
          data: base64,
        },
      });
      contents.push(prompt);
    } else {
      contents.push(`${prompt}\n\nDocument Text Content:\n${text || ''}`);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    const responseText = response.text || '';
    // Clean up code fences
    const cleanJson = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/gi, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (parseErr) {
      console.error('JSON Parse error on Gemini output:', responseText);
      return res.status(422).json({
        error: 'Could not confidently understand this timetable.',
        raw: responseText,
      });
    }
  } catch (err: any) {
    console.error('Error in /api/ai/parse-timetable:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process timetable with AI',
    });
  }
});

/**
 * Endpoint: Parse Student Roster File with Gemini AI
 */
app.post('/api/ai/parse-roster', async (req: Request, res: Response) => {
  try {
    const { fileType, text, base64, mimeType, filename } = req.body;

    if (!base64 && !text) {
      return res.status(400).json({ error: 'No roster file data provided' });
    }

    const prompt = `You are an academic student roster parsing system.
Extract student records from the uploaded roster file (${filename || 'roster'}).

CRITICAL INSTRUCTIONS:
1. Extract for each student:
   - "id": unique string (e.g., student register number)
   - "name": full student name
   - "regNo": official register number / roll number (e.g., "RA2211003010001")
   - "department": department name (e.g., "ECE", "BME", "CSE", "SEEE")
   - "year": e.g., "II Year", "III Year", "I Year", "IV Year"
   - "section": e.g., "II ECE DS-A", "III ECE-B", etc.
   - "historicalPercentage": optional historical attendance percentage number if present in roster (e.g., 88.5)
2. Return ONLY strict JSON in this format:
{
  "summary": "Extracted X student records across Y sections",
  "students": [
     {
       "id": "...",
       "name": "...",
       "regNo": "...",
       "department": "...",
       "year": "...",
       "section": "...",
       "historicalPercentage": 85.0
     }
  ]
}`;

    const contents: any[] = [];
    if (fileType === 'pdf' && base64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'application/pdf',
          data: base64,
        },
      });
      contents.push(prompt);
    } else {
      contents.push(`${prompt}\n\nDocument Text Content:\n${text || ''}`);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    const responseText = response.text || '';
    const cleanJson = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/gi, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (parseErr) {
      return res.status(422).json({
        error: 'Could not parse student roster.',
        raw: responseText,
      });
    }
  } catch (err: any) {
    console.error('Error in /api/ai/parse-roster:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process student roster',
    });
  }
});

/**
 * Endpoint: AI Attendance Chatbot
 * Uses current live application context (student, section, timetable, attendance, OD/Medical, dates)
 */
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      selectedStudent,
      selectedSection,
      currentStats,
      subjectBreakdowns,
      upcomingClassesNextDays,
      daysRemaining,
      effectiveStartDate,
      planUntilDate,
      chatHistory,
    } = req.body;

    const systemPrompt = `You are the SRM Attendance Intelligence Advisor for SRM Institute of Science and Technology.
You give precise, mathematically grounded, actionable answers directly based on the student's REAL application data provided below.

ACADEMIC REGULATIONS & MATHEMATICAL RULES:
1. SAFE target: ≥ 90% attendance.
2. AT RISK: 75% to 89.9% attendance.
3. DETENTION threshold: Mandatory 75%. Below 75% means debarment from semester exams!
4. RECOVERY:
   - If recovery to 75% is mathematically possible: Calculate exact upcoming classes the student must attend.
   - If recovery to 75% is mathematically impossible: Prominently state "IRREVERSIBLE DETENTION" and explain why even 100% attendance cannot reach 75%.
5. ATTENDANCE CATEGORIES:
   - Regular Present = 1
   - OD (On Duty) = 1 (mathematically counts as Present!)
   - Medical Leave = 1 (mathematically counts as Present!)
   - Absent = 0
6. CALENDAR SOURCE OF TRUTH:
   - Classes are counted day-by-day on actual calendar dates between ${effectiveStartDate} and ${planUntilDate}.
   - Never use "weeks × classes per week". Use the actual timetable slots.

CURRENT STUDENT & LIVE ATTENDANCE DATA:
- Active Section: ${selectedSection?.name || 'Unknown'} (${selectedSection?.year || ''} - ${selectedSection?.semester || ''}, Venue: ${selectedSection?.venue || ''})
- Selected Student: ${selectedStudent ? `${selectedStudent.name} (${selectedStudent.regNo})` : 'Self-guided mode'}
- Overall Attendance: ${currentStats?.overallPercentage !== null ? `${currentStats?.overallPercentage}%` : 'No data recorded'}
- Overall Status: ${currentStats?.overallStatus || 'N/A'}
- Total Attended: ${currentStats?.totalAttended || 0} (Regular Present: ${currentStats?.totalRegularPresent || 0}, OD: ${currentStats?.totalOD || 0}, Medical Leave: ${currentStats?.totalMedical || 0})
- Total Conducted: ${currentStats?.totalConducted || 0}
- Total Absent: ${currentStats?.totalAbsent || 0}
- Remaining Scheduled Classes: ${currentStats?.totalRemainingClasses || 0}
- Assessment Period: ${effectiveStartDate} to ${planUntilDate} (${daysRemaining} calendar days remaining)
- Subjects Below 90%: ${currentStats?.subjectsBelow90Count || 0}
- Subjects Below 75% (Detention): ${currentStats?.subjectsBelow75Count || 0}
- Irreversible Detention Subjects: ${currentStats?.irreversibleDetentionCount || 0}

SUBJECT BREAKDOWNS:
${JSON.stringify(subjectBreakdowns || [], null, 2)}

UPCOMING SCHEDULED CLASSES (Next 7 Calendar Days):
${JSON.stringify(upcomingClassesNextDays || [], null, 2)}

INSTRUCTIONS FOR RESPONSE FORMATTING AND TONE:
- Write in clean, professional, natural sentences with generous spacing.
- STRICTLY DO NOT use Markdown formatting symbols like "###", "**", "---", bullet symbols like bullet dots, asterisks, or hashtags.
- DO NOT use excessive emojis or decorative characters.
- Keep responses concise for simple questions (1-3 clear sentences).
- For complex advice, break text into short paragraphs separated by blank lines.
- State numbers, percentages, and subject names cleanly and directly.
- Avoid messy walls of text. Make every response easy to read at a glance.
- Answer the user's specific question directly based on their real timetable numbers provided above.`;

    const userMessage = `User Question: ${message}`;

    const contents: any[] = [
      systemPrompt,
      ...(chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Student' : 'Advisor'}: ${m.content}`),
      userMessage,
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    return res.json({
      reply: response.text || 'I analyzed your attendance data. Please see the recommendations above.',
    });
  } catch (err: any) {
    console.error('Error in /api/ai/chat:', err);
    return res.status(500).json({
      error: err.message || 'Chat service encountered an error',
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SRM Attendance Predictor Server listening on port ${PORT}`);
  });
}

startServer();
