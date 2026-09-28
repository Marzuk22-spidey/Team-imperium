import { SectionTimetable, TimetableSlot } from '../types';

export const PERIOD_TIMINGS: Record<number, string> = {
  1: '09:00 - 09:50',
  2: '09:50 - 10:40',
  3: '10:50 - 11:40',
  4: '11:40 - 12:30',
  5: '01:20 - 02:10',
  6: '02:10 - 03:00',
  7: '03:10 - 04:00',
  8: '04:00 - 04:50',
};

const createSlots = (
  items: (string | { id: string; period: number })[]
): TimetableSlot[] => {
  return items.map((item, idx) => {
    if (typeof item === 'string') {
      const isProject = item === 'B-Proj';
      const isLab = item.includes('LAB');
      return {
        period: idx + 1,
        time: PERIOD_TIMINGS[idx + 1] || '',
        subjectId: item,
        attendanceCount: true,
        isProject,
      };
    } else {
      const isProject = item.id === 'B-Proj';
      return {
        period: item.period,
        time: PERIOD_TIMINGS[item.period] || '',
        subjectId: item.id,
        attendanceCount: true,
        isProject,
      };
    }
  });
};

export const TIMETABLES: SectionTimetable[] = [
  // 1. 1st Year SEEE
  {
    id: '1st-year-seee',
    name: '1st Year SEEE',
    year: 'I Year',
    semester: 'I Semester',
    venue: 'Basic Sciences Block BS-204',
    subjects: {
      A: { id: 'A', code: '21MAB101T', name: 'Calculus and Linear Algebra' },
      B: { id: 'B', code: '21PYB101J', name: 'Semiconductor Physics' },
      C: { id: 'C', code: '21CYB101J', name: 'Chemistry' },
      D: { id: 'D', code: '21CSS101J', name: 'Programming for Problem Solving' },
      E: { id: 'E', code: '21EES101T', name: 'Basic Electrical and Electronics Engineering' },
      F: { id: 'F', code: '21LEH101T', name: 'Communicative English' },
      G: { id: 'G', code: '21LEM101T', name: 'Universal Human Values' },
      LAB: { id: 'LAB', code: '21CSS101L', name: 'Programming & Computing Laboratory', isLab: true },
    },
    schedule: {
      Monday: createSlots(['A', 'B', 'C', 'D', 'E']),
      Tuesday: createSlots(['D', 'E', 'A', 'B', 'LAB', 'LAB']),
      Wednesday: createSlots(['B', 'C', 'E', 'A', 'F']),
      Thursday: createSlots(['C', 'D', 'A', 'E', 'G', 'G']),
      Friday: createSlots(['E', 'A', 'B', 'D', 'LAB', 'LAB']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 2. II BME
  {
    id: 'ii-bme',
    name: 'II BME',
    year: 'II Year',
    semester: 'III Semester',
    venue: 'EEC-107, 309 / Bio Block',
    subjects: {
      A: { id: 'A', code: '21MAB201T', name: 'Transforms and Boundary Value Problems' },
      B: { id: 'B', code: '21BMC202T', name: 'Biomedical Signals and Systems' },
      C: { id: 'C', code: '21BMC203J', name: 'Electric and Electronic Circuits' },
      D: { id: 'D', code: '21BMC204J', name: 'Digital Logic for Medical Systems' },
      E: { id: 'E', code: '21PYS202T', name: 'Medical Physics' },
      F: { id: 'F', code: '21LEM201T', name: 'Professional Ethics' },
      G: { id: 'G', code: '21LEM202T', name: 'Universal Human Values-II' },
      H: { id: 'H', code: '21PDM201L', name: 'Verbal Reasoning' },
      I: { id: 'I', code: '21PDH201T', name: 'Social Engineering' },
      DLMS: { id: 'DLMS', code: '21BMC204J-DLMS', name: 'DLMS / EEC-107,309', isLab: true },
    },
    schedule: {
      Monday: createSlots([
        { id: 'E', period: 1 },
        { id: 'C', period: 2 },
        { id: 'DLMS', period: 3 },
        { id: 'DLMS', period: 4 },
        { id: 'H', period: 7 },
        { id: 'H', period: 8 },
      ]),
      Tuesday: createSlots([
        { id: 'C', period: 1 },
        { id: 'E', period: 2 },
        { id: 'B', period: 3 },
        { id: 'B', period: 4 },
        { id: 'A', period: 5 },
        { id: 'G', period: 7 },
        { id: 'G', period: 8 },
      ]),
      Wednesday: createSlots([
        { id: 'B', period: 1 },
        { id: 'D', period: 2 },
        { id: 'A', period: 3 },
      ]),
      Thursday: createSlots([
        { id: 'A', period: 1 },
        { id: 'E', period: 2 },
        { id: 'B', period: 3 },
        { id: 'D', period: 4 },
        { id: 'DLMS', period: 7 },
        { id: 'DLMS', period: 8 },
      ]),
      Friday: createSlots([
        { id: 'F', period: 1 },
        { id: 'A', period: 2 },
        { id: 'C', period: 3 },
        { id: 'D', period: 4 },
        { id: 'G', period: 7 },
        { id: 'G', period: 8 },
      ]),
      Saturday: [],
      Sunday: [],
    },
  },

  // 3. II ECE DS-A
  {
    id: 'ii-ece-ds-a',
    name: 'II ECE DS-A',
    year: 'II Year',
    semester: 'III Semester',
    venue: 'Tech Park TP-401',
    subjects: {
      A: { id: 'A', code: '21MAB201T', name: 'Transforms and Boundary Value Problems' },
      B: { id: 'B', code: '21ECC201T', name: 'Solid State Devices' },
      C: { id: 'C', code: '21CSS201T', name: 'Computer Organization and Architecture' },
      D: { id: 'D', code: '21ECC203T', name: 'Digital Logic Design' },
      E: { id: 'E', code: '21ECC205T', name: 'Electromagnetic Theory and Interference' },
      F: { id: 'F', code: '21LEM201T', name: 'Professional Ethics' },
      G: { id: 'G', code: '21LEM202T', name: 'Universal Human Values-II' },
      H: { id: 'H', code: '21PDM201L', name: 'Verbal Reasoning' },
      I: { id: 'I', code: '21PDH209T', name: 'Social Engineering' },
      LAB: { id: 'LAB', code: '21ECC211L', name: 'Devices and Digital IC Laboratory', isLab: true },
    },
    schedule: {
      Monday: createSlots(['E', 'A', 'I', 'G', 'LAB']),
      Tuesday: createSlots(['C', 'A', 'E', 'D', 'G', 'H']),
      Wednesday: createSlots(['A', 'B', 'C', 'D', 'H']),
      Thursday: createSlots(['B', 'C', 'A', 'F', 'LAB']),
      Friday: createSlots(['D', 'B', 'E', 'C']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 4. II ECE DS-B
  {
    id: 'ii-ece-ds-b',
    name: 'II ECE DS-B',
    year: 'II Year',
    semester: 'III Semester',
    venue: 'Tech Park TP-402',
    subjects: {
      A: { id: 'A', code: '21MAB201T', name: 'Transforms and Boundary Value Problems' },
      B: { id: 'B', code: '21ECC201T', name: 'Solid State Devices' },
      C: { id: 'C', code: '21CSS201T', name: 'Computer Organization and Architecture' },
      D: { id: 'D', code: '21ECC203T', name: 'Digital Logic Design' },
      E: { id: 'E', code: '21ECC205T', name: 'Electromagnetic Theory and Interference' },
      F: { id: 'F', code: '21LEM201T', name: 'Professional Ethics' },
      G: { id: 'G', code: '21LEM202T', name: 'Universal Human Values-II' },
      H: { id: 'H', code: '21PDM201L', name: 'Verbal Reasoning' },
      I: { id: 'I', code: '21PDH209T', name: 'Social Engineering' },
      LAB: { id: 'LAB', code: '21ECC211L', name: 'Devices and Digital IC Laboratory', isLab: true },
    },
    schedule: {
      Monday: createSlots(['D', 'B', 'C', 'I']),
      Tuesday: createSlots(['LAB', 'LAB', 'C', 'D', 'I', 'E']),
      Wednesday: createSlots(['G', 'G', 'E', 'A', 'A', 'D']),
      Thursday: createSlots(['G', 'A', 'C', 'B', 'E']),
      Friday: createSlots(['H', 'H', 'F', 'A', 'B', 'C']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 5. III BME
  {
    id: 'iii-bme',
    name: 'III BME',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'Bio Block BB-302',
    subjects: {
      A: { id: 'A', code: '21MAB301T', name: 'Probability and Statistics' },
      B: { id: 'B', code: '21BMC302J', name: 'Microcontrollers and Its Application in Medicine' },
      C: { id: 'C', code: '21BMC301J', name: 'Biomedical Signal Processing' },
      D: { id: 'D', code: '21BME266T', name: 'Biometrics' },
      E: { id: 'E', code: '21ECO103T', name: 'Modern Wireless Communication System' },
      F: { id: 'F', code: '21BMC303T', name: 'Principles of Medical Imaging' },
      G: { id: 'G', code: '21PDM301L', name: 'Analytical and Logical Thinking Skills' },
      H: { id: 'H', code: '21LEM301T', name: 'Indian Art Form' },
      I: { id: 'I', code: '21GNP301L', name: 'Community Connect' },
      'MPMC LAB': { id: 'MPMC LAB', code: '21BMC311L', name: 'MPMC Laboratory', isLab: true },
      'BIO DSP LAB': { id: 'BIO DSP LAB', code: '21BMC312L', name: 'Bio DSP Laboratory', isLab: true },
    },
    schedule: {
      Monday: createSlots(['G', 'G', 'MPMC LAB', 'MPMC LAB', 'E', 'B', 'F', 'H']),
      Tuesday: createSlots(['BIO DSP LAB', 'BIO DSP LAB', 'G', 'C', 'D', 'A', 'B']),
      Wednesday: createSlots(['C', 'A', 'F', 'D']),
      Thursday: createSlots(['I', 'I', 'A', 'C', 'E', 'B']),
      Friday: createSlots(['I', 'I', 'F', 'A', 'D', 'E']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 6. III ECE-A
  {
    id: 'iii-ece-a',
    name: 'III ECE-A',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'Tech Park TP-501',
    subjects: {
      A: { id: 'A', code: '21MAB302T', name: 'Discrete Mathematics' },
      B: { id: 'B', code: '21ECC301P', name: 'Microprocessor, Microcontroller, and Interfacing Techniques' },
      C: { id: 'C', code: '21ECC303T', name: 'VLSI Design and Technology' },
      D: { id: 'D', code: '21ECE468T', name: 'System and Network on Chip' },
      E: { id: 'E', code: '21CSO355T', name: 'Machine Learning for All' },
      F: { id: 'F', code: '21GNP301L', name: 'Community Connect' },
      G: { id: 'G', code: '21PDM301L', name: 'Analytical and Logical Thinking Skills' },
      H: { id: 'H', code: '21LEM301T', name: 'Indian Art Form' },
      LAB: { id: 'LAB', code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', isLab: true },
      'B-Proj': { id: 'B-Proj', code: '21ECC301P-PROJ', name: 'Microprocessor Project Slot', isProject: true },
    },
    schedule: {
      Monday: createSlots(['E', 'B', 'B', 'A', 'G']),
      Tuesday: createSlots(['H', 'D', 'B', 'B-Proj', 'G', 'LAB']),
      Wednesday: createSlots(['C', 'A', 'D', 'F', 'LAB']),
      Thursday: createSlots(['A', 'E', 'C', 'F']),
      Friday: createSlots(['D', 'A', 'E', 'C']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 7. III ECE-B
  {
    id: 'iii-ece-b',
    name: 'III ECE-B',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'Tech Park TP-502',
    subjects: {
      A: { id: 'A', code: '21MAB302T', name: 'Discrete Mathematics' },
      B: { id: 'B', code: '21ECC301P', name: 'Microprocessor, Microcontroller, and Interfacing Techniques' },
      C: { id: 'C', code: '21ECC303T', name: 'VLSI Design and Technology' },
      D: { id: 'D', code: '21ECE468T', name: 'System and Network on Chip' },
      E: { id: 'E', code: '21CSO355T', name: 'Machine Learning for All' },
      F: { id: 'F', code: '21GNP301L', name: 'Community Connect' },
      G: { id: 'G', code: '21PDM301L', name: 'Analytical and Logical Thinking Skills' },
      H: { id: 'H', code: '21LEM301T', name: 'Indian Art Form' },
      LAB: { id: 'LAB', code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', isLab: true },
      'B-Proj': { id: 'B-Proj', code: '21ECC301P-PROJ', name: 'Microprocessor Project Slot', isProject: true },
    },
    schedule: {
      Monday: createSlots(['LAB', 'E', 'B', 'A', 'D']),
      Tuesday: createSlots(['G', 'F', 'B', 'D', 'C']),
      Wednesday: createSlots(['G', 'B-Proj', 'B', 'A', 'H']),
      Thursday: createSlots(['LAB', 'A', 'C', 'E', 'F']),
      Friday: createSlots(['C', 'A', 'E', 'D']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 8. III ECE-DS
  {
    id: 'iii-ece-ds',
    name: 'III ECE-DS',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'Tech Park TP-505',
    subjects: {
      A: { id: 'A', code: '21MAB302T', name: 'Discrete Mathematics' },
      B: { id: 'B', code: '21ECC301P', name: 'Microprocessor, Microcontroller, and Interfacing Techniques' },
      C: { id: 'C', code: '21ECC303T', name: 'VLSI Design and Technology' },
      D: { id: 'D', code: '21CSO355T', name: 'Machine Learning for All' },
      E: { id: 'E', code: '21ECE371T', name: 'Database Design and Management' },
      F: { id: 'F', code: '21GNP301L', name: 'Community Connect' },
      G: { id: 'G', code: '21PDM301L', name: 'Analytical and Logical Thinking Skills' },
      H: { id: 'H', code: '21LEM301T', name: 'Indian Art Form' },
      LAB: { id: 'LAB', code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', isLab: true },
      'B-Proj': { id: 'B-Proj', code: '21ECC301P-PROJ', name: 'Microprocessor Project Slot', isProject: true },
    },
    schedule: {
      Monday: createSlots(['E', 'B', 'C', 'A']),
      Tuesday: createSlots(['C', 'B', 'D', 'F', 'LAB', 'LAB']),
      Wednesday: createSlots(['H', 'B', 'A', 'C', 'G', 'G']),
      Thursday: createSlots(['A', 'D', 'E', 'F']),
      Friday: createSlots(['D', 'A', 'E', 'B-Proj', 'G', 'G', 'LAB', 'LAB']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 9. IV ECE-A
  {
    id: 'iv-ece-a',
    name: 'IV ECE-A',
    year: 'IV Year',
    semester: 'VII Semester',
    venue: 'Tech Park TP-601',
    subjects: {
      A: { id: 'A', code: '21GNH401T', name: 'Behavioural Psychology' },
      B: { id: 'B', code: '21ECC401T', name: 'Wireless Communication and Antenna Systems' },
      C: { id: 'C', code: '21ECC402P', name: 'Computer Communication and Network Security' },
      D: { id: 'D', code: '21ECE461T', name: 'Semiconductor Memory Design' },
      E: { id: 'E', code: '21ECE463T', name: 'Scripting Language for Electronic Design Automation' },
      F: { id: 'F', code: '21CSO355T', name: 'Machine Learning for All' },
      LAB: { id: 'LAB', code: '21ECC402P-LAB', name: 'Computer Communication & Network Security Lab', isLab: true },
    },
    schedule: {
      Monday: createSlots(['C', 'A', 'D']),
      Tuesday: createSlots(['C', 'D', 'B', 'F']),
      Wednesday: createSlots(['B', 'LAB', 'E', 'F']),
      Thursday: createSlots(['F', 'A', 'E', 'B']),
      Friday: createSlots(['C', 'A', 'D', 'E']),
      Saturday: [],
      Sunday: [],
    },
  },

  // 10. IV ECE-B
  {
    id: 'iv-ece-b',
    name: 'IV ECE-B',
    year: 'IV Year',
    semester: 'VII Semester',
    venue: 'Tech Park TP-602',
    subjects: {
      A: { id: 'A', code: '21GNH401T', name: 'Behavioural Psychology' },
      B: { id: 'B', code: '21ECC401T', name: 'Wireless Communication and Antenna Systems' },
      C: { id: 'C', code: '21ECC402P', name: 'Computer Communication and Network Security' },
      D: { id: 'D', code: '21ECE461T', name: 'Semiconductor Memory Design' },
      E: { id: 'E', code: '21ECE463T', name: 'Scripting Language for Electronic Design Automation' },
      F: { id: 'F', code: '21CSO355T', name: 'Machine Learning for All' },
      LAB: { id: 'LAB', code: '21ECC402P-LAB', name: 'Computer Communication & Network Security Lab', isLab: true },
    },
    schedule: {
      Monday: createSlots(['C', 'A', 'E', 'F']),
      Tuesday: createSlots(['C', 'E', 'F', 'B']),
      Wednesday: createSlots(['C', 'D', 'A', 'B']),
      Thursday: createSlots(['D', 'B', 'LAB', 'A']),
      Friday: createSlots(['E', 'D', 'F']),
      Saturday: [],
      Sunday: [],
    },
  },
];
