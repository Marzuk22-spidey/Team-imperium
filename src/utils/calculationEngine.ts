import {
  Holiday,
  OverallPrediction,
  ScheduledClassOccurrence,
  SectionTimetable,
  Subject,
  SubjectAttendanceRecord,
  SubjectPrediction,
} from '../types';
import {
  getDayOfWeek,
  isHolidayDate,
  isWeekend,
  parseDateString,
  toDateString,
} from './dateUtils';

/**
 * Counts all scheduled class occurrences for each subject between two dates (inclusive).
 * Traverses calendar day by day, respecting weekends and registered holidays.
 */
export function getClassesBetweenDates(
  section: SectionTimetable,
  startDateStr: string,
  endDateStr: string,
  holidays: Holiday[],
  includeProjectSlots: boolean = true
): {
  subjectCounts: Record<string, number>;
  occurrences: Record<string, ScheduledClassOccurrence[]>;
  totalScheduledSlots: number;
} {
  const subjectCounts: Record<string, number> = {};
  const occurrences: Record<string, ScheduledClassOccurrence[]> = {};

  // Initialize all subjects with 0
  Object.keys(section.subjects).forEach((subId) => {
    subjectCounts[subId] = 0;
    occurrences[subId] = [];
  });

  if (startDateStr > endDateStr) {
    return { subjectCounts, occurrences, totalScheduledSlots: 0 };
  }

  const start = parseDateString(startDateStr);
  const end = parseDateString(endDateStr);
  let totalSlots = 0;

  const current = new Date(start.getTime());

  while (current.getTime() <= end.getTime()) {
    const dateStr = toDateString(current);
    const dayOfWeek = getDayOfWeek(current);

    // Skip weekends
    if (!isWeekend(current)) {
      // Skip holidays
      const { isHoliday } = isHolidayDate(dateStr, holidays);
      if (!isHoliday) {
        const daySlots = section.schedule[dayOfWeek] || [];

        for (const slot of daySlots) {
          // Check project slot inclusion
          if (slot.isProject && !includeProjectSlots) {
            continue;
          }

          if (slot.attendanceCount) {
            const subId = slot.subjectId;
            subjectCounts[subId] = (subjectCounts[subId] || 0) + 1;

            if (!occurrences[subId]) {
              occurrences[subId] = [];
            }

            occurrences[subId].push({
              date: dateStr,
              day: dayOfWeek,
              period: slot.period,
              time: slot.time,
              subjectId: subId,
            });

            totalSlots += 1;
          }
        }
      }
    }

    // Advance 1 day
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return {
    subjectCounts,
    occurrences,
    totalScheduledSlots: totalSlots,
  };
}

/**
 * Calculates predictive attendance metrics for an individual subject.
 * Note: Attended mathematically includes Regular Present + OD (On Duty) + Medical Leave.
 */
export function calculateSubjectPrediction(
  subject: Subject,
  rawConducted: number,
  rawAttended: number,
  remainingClasses: number,
  occurrences: ScheduledClassOccurrence[] = [],
  rawOdCount: number = 0,
  rawMedicalCount: number = 0,
  rawAbsentCount?: number
): SubjectPrediction {
  const conducted = Math.max(0, Math.floor(rawConducted || 0));
  const attended = Math.max(0, Math.min(conducted, Math.floor(rawAttended || 0)));
  const odCount = Math.max(0, Math.min(attended, Math.floor(rawOdCount || 0)));
  const medicalCount = Math.max(0, Math.min(attended - odCount, Math.floor(rawMedicalCount || 0)));
  const regularPresent = Math.max(0, attended - odCount - medicalCount);
  const absentCount = Math.max(0, conducted - attended);

  const totalClassesAtEnd = conducted + remainingClasses;

  const currentPercentage =
    conducted > 0 ? Math.round((attended / conducted) * 1000) / 10 : null;

  // Max possible attendance if student attends 100% of remaining classes
  let maxPossiblePercentage = 100.0;
  if (totalClassesAtEnd > 0) {
    maxPossiblePercentage =
      Math.round(((attended + remainingClasses) / totalClassesAtEnd) * 1000) / 10;
  }

  // 90% Target calculation
  // (A + X) / (C + R) >= 0.90  =>  X >= 0.90 * (C + R) - A
  let requiredFor90: number | null = null;
  let is90Possible = true;

  if (totalClassesAtEnd > 0) {
    const rawX90 = Math.ceil(0.9 * totalClassesAtEnd - attended);
    const minNeeded90 = Math.max(0, rawX90);

    if (minNeeded90 > remainingClasses) {
      is90Possible = false;
      requiredFor90 = null;
    } else {
      is90Possible = true;
      requiredFor90 = minNeeded90;
    }
  } else {
    is90Possible = true;
    requiredFor90 = 0;
  }

  // Maximum classes that can be missed while staying >= 90%
  let maxClassesMissable90 = 0;
  if (is90Possible && requiredFor90 !== null) {
    maxClassesMissable90 = Math.max(0, remainingClasses - requiredFor90);
  }

  // 75% Detention Recovery calculation
  // (A + X) / (C + R) >= 0.75  =>  X >= 0.75 * (C + R) - A
  let requiredFor75: number | null = null;
  let is75Possible = true;

  if (totalClassesAtEnd > 0) {
    const rawX75 = Math.ceil(0.75 * totalClassesAtEnd - attended);
    const minNeeded75 = Math.max(0, rawX75);

    if (minNeeded75 > remainingClasses) {
      is75Possible = false;
      requiredFor75 = null;
    } else {
      is75Possible = true;
      requiredFor75 = minNeeded75;
    }
  } else {
    is75Possible = true;
    requiredFor75 = 0;
  }

  // Status determination
  let status: SubjectPrediction['status'] = 'SAFE';

  if (conducted === 0) {
    status = 'SAFE';
  } else if (currentPercentage !== null) {
    if (currentPercentage >= 90) {
      status = 'SAFE';
    } else if (currentPercentage >= 75) {
      status = 'AT_RISK';
    } else {
      // Under 75% - Detention zone
      if (!is75Possible) {
        status = 'IRREVERSIBLE_DETENTION';
      } else {
        status = 'DETENTION';
      }
    }
  }

  return {
    subjectId: subject.id,
    subject,
    conducted,
    attended,
    regularPresent,
    odCount,
    medicalCount,
    absentCount,
    currentPercentage,
    remainingClasses,
    totalClassesAtEnd,
    requiredFor90,
    is90Possible,
    maxClassesMissable90,
    requiredFor75,
    is75Possible,
    maxPossiblePercentage,
    status,
    occurrences,
  };
}

/**
 * Calculates aggregate dashboard metrics.
 * CRITICAL RULE: Never average subject percentages. Always use sum(attended) / sum(conducted) * 100.
 */
export function calculateOverallPrediction(
  predictions: SubjectPrediction[]
): OverallPrediction {
  let totalAttended = 0;
  let totalConducted = 0;
  let totalRegularPresent = 0;
  let totalOD = 0;
  let totalMedical = 0;
  let totalAbsent = 0;
  let totalRemainingClasses = 0;
  let subjectsBelow90Count = 0;
  let subjectsBelow75Count = 0;
  let irreversibleDetentionCount = 0;

  for (const p of predictions) {
    totalAttended += p.attended;
    totalConducted += p.conducted;
    totalRegularPresent += p.regularPresent;
    totalOD += p.odCount;
    totalMedical += p.medicalCount;
    totalAbsent += p.absentCount;
    totalRemainingClasses += p.remainingClasses;

    if (p.conducted > 0 && p.currentPercentage !== null) {
      if (p.currentPercentage < 90) {
        subjectsBelow90Count += 1;
      }
      if (p.currentPercentage < 75) {
        subjectsBelow75Count += 1;
      }
      if (p.status === 'IRREVERSIBLE_DETENTION') {
        irreversibleDetentionCount += 1;
      }
    }
  }

  const overallPercentage =
    totalConducted > 0
      ? Math.round((totalAttended / totalConducted) * 1000) / 10
      : null;

  let overallStatus: OverallPrediction['overallStatus'] = 'SAFE';

  if (overallPercentage === null) {
    overallStatus = 'SAFE';
  } else if (overallPercentage >= 90) {
    overallStatus = 'SAFE';
  } else if (overallPercentage >= 75) {
    overallStatus = 'AT_RISK';
  } else {
    // Check if recovery is mathematically possible overall
    const totalEnd = totalConducted + totalRemainingClasses;
    if (totalEnd > 0 && (totalAttended + totalRemainingClasses) / totalEnd < 0.75) {
      overallStatus = 'IRREVERSIBLE_DETENTION';
    } else {
      overallStatus = 'DETENTION';
    }
  }

  return {
    totalConducted,
    totalAttended,
    totalRegularPresent,
    totalOD,
    totalMedical,
    totalAbsent,
    overallPercentage,
    totalRemainingClasses,
    subjectsBelow90Count,
    subjectsBelow75Count,
    irreversibleDetentionCount,
    overallStatus,
    predictions,
  };
}

/**
 * "What-If?" simulator calculation for projecting subject attendance
 * when attending X out of R remaining classes.
 */
export function simulateAttendance(
  conducted: number,
  attended: number,
  remaining: number,
  classesToAttend: number
): {
  projectedPercentage: number;
  classesMissed: number;
  status: 'SAFE' | 'AT_RISK' | 'DETENTION';
} {
  const safeAttend = Math.max(0, Math.min(remaining, classesToAttend));
  const classesMissed = remaining - safeAttend;
  const totalClasses = conducted + remaining;

  if (totalClasses === 0) {
    return { projectedPercentage: 100.0, classesMissed: 0, status: 'SAFE' };
  }

  const projectedPercentage =
    Math.round(((attended + safeAttend) / totalClasses) * 1000) / 10;

  let status: 'SAFE' | 'AT_RISK' | 'DETENTION' = 'SAFE';
  if (projectedPercentage >= 90) {
    status = 'SAFE';
  } else if (projectedPercentage >= 75) {
    status = 'AT_RISK';
  } else {
    status = 'DETENTION';
  }

  return {
    projectedPercentage,
    classesMissed,
    status,
  };
}
