import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Student,
  SectionTimetable,
  OverallPrediction,
  SubjectPrediction,
  ChatMessage,
} from '../types';
import { getDayOfWeek, parseDateString, toDateString } from '../utils/dateUtils';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface AIAttendanceChatbotProps {
  selectedStudent: Student | null;
  selectedSection: SectionTimetable;
  overall: OverallPrediction;
  predictions: SubjectPrediction[];
  effectiveStartDate: string;
  planUntilDate: string;
  daysRemaining: number;
}

/**
 * Formats AI chat responses cleanly:
 * - Strips messy markdown asterisks, hashes, and raw bullet symbols
 * - Highlights attendance percentages, status terms, and key counts through the UI
 * - Renders short natural paragraphs and structured cards without walls of text
 */
const FormattedChatResponse: React.FC<{ content: string }> = ({ content }) => {
  // Clean raw markdown artifacts
  const cleaned = useMemo(() => {
    return content
      .replace(/###\s*/g, '')
      .replace(/##\s*/g, '')
      .replace(/#\s*/g, '')
      .replace(/---\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // remove *italic*
      .trim();
  }, [content]);

  // Split into clean paragraphs
  const paragraphs = useMemo(() => {
    return cleaned
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [cleaned]);

  /**
   * Highlights numbers, percentages, and attendance status tokens in a sentence
   */
  const highlightEntities = (text: string) => {
    // Regex matching percentages (e.g. 85.5% or 75%), status terms, and key numbers
    const tokenRegex =
      /(\b\d+(?:\.\d+)?%\b|\bIRREVERSIBLE DETENTION\b|\bDETENTION ZONE\b|\bDETENTION\b|\bAT RISK\b|\bSAFE ZONE\b|\bSAFE\b|\b\d+\s+classes\b|\b\d+\s+scheduled classes\b|\b\d+\s+periods\b)/gi;

    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      const lower = part.toLowerCase();

      // Percentage highlight
      if (/^\d+(?:\.\d+)?%$/.test(part)) {
        const val = parseFloat(part);
        let colorClasses = 'bg-slate-800 text-slate-200 border-slate-700';
        if (val >= 90) {
          colorClasses = 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
        } else if (val >= 75) {
          colorClasses = 'bg-amber-950/70 border-amber-500/40 text-amber-300';
        } else {
          colorClasses = 'bg-rose-950/70 border-rose-500/40 text-rose-300';
        }

        return (
          <span
            key={index}
            className={`inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[11px] font-mono font-bold border ${colorClasses}`}
          >
            {part}
          </span>
        );
      }

      // Status Badge: IRREVERSIBLE DETENTION
      if (lower === 'irreversible detention') {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-200 border border-rose-600 font-mono tracking-wide"
          >
            <AlertOctagon className="w-3 h-3 text-rose-400 inline" />
            IRREVERSIBLE DETENTION
          </span>
        );
      }

      // Status Badge: DETENTION
      if (lower === 'detention' || lower === 'detention zone') {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40 font-mono"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400 inline" />
            DETENTION (&lt; 75%)
          </span>
        );
      }

      // Status Badge: AT RISK
      if (lower === 'at risk') {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 font-mono"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400 inline" />
            AT RISK (75% - 89%)
          </span>
        );
      }

      // Status Badge: SAFE
      if (lower === 'safe' || lower === 'safe zone') {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
            SAFE (≥ 90%)
          </span>
        );
      }

      // Class counts highlight
      if (/^\d+\s+(classes|scheduled classes|periods)$/i.test(part)) {
        return (
          <span
            key={index}
            className="font-mono font-semibold text-indigo-300 px-1 py-0.2 bg-indigo-950/50 rounded border border-indigo-500/20 mx-0.5"
          >
            {part}
          </span>
        );
      }

      return part;
    });
  };

  return (
    <div className="space-y-2.5 text-[12.5px] leading-relaxed text-slate-200">
      {paragraphs.map((p, pIdx) => {
        // Check if paragraph is composed of bullet-like lines
        const lines = p.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        const isListLike =
          lines.length > 1 &&
          lines.some((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || l.includes(':'));

        if (isListLike) {
          return (
            <div
              key={pIdx}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs shadow-inner"
            >
              {lines.map((line, lIdx) => {
                const cleanedLine = line.replace(/^[•\-\*]\s*/, '').trim();
                const colonIndex = cleanedLine.indexOf(':');

                if (colonIndex > 0 && colonIndex < 35) {
                  const label = cleanedLine.slice(0, colonIndex).trim();
                  const val = cleanedLine.slice(colonIndex + 1).trim();

                  return (
                    <div
                      key={lIdx}
                      className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1 border-b border-slate-850 last:border-0"
                    >
                      <span className="text-slate-400 font-medium text-[11px] shrink-0">
                        {label}
                      </span>
                      <span className="text-slate-200 text-right sm:text-right">
                        {highlightEntities(val)}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={lIdx} className="flex items-start gap-1.5 text-slate-300 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{highlightEntities(cleanedLine)}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <p key={pIdx} className="text-slate-200 leading-normal">
            {highlightEntities(p)}
          </p>
        );
      })}
    </div>
  );
};

export const AIAttendanceChatbot: React.FC<AIAttendanceChatbotProps> = ({
  selectedStudent,
  selectedSection,
  overall,
  predictions,
  effectiveStartDate,
  planUntilDate,
  daysRemaining,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial natural greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I am your attendance assistant for ${selectedSection.name}.\n\nAsk me about tomorrow's classes, how many sessions you can safely miss, or what is needed to reach 75% or 90%.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [selectedSection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  // Tomorrow's schedule calculation
  const getTomorrowSchedule = () => {
    const cur = parseDateString(effectiveStartDate);
    cur.setUTCDate(cur.getUTCDate() + 1);
    const tomDateStr = toDateString(cur);
    const day = getDayOfWeek(cur);
    const slots = selectedSection.schedule[day] || [];
    return {
      dateStr: tomDateStr,
      day,
      slots,
    };
  };

  /**
   * Local analytical reasoning engine providing clean, natural responses without markdown symbols
   */
  const generateAnalyticalResponse = (query: string): string => {
    const lower = query.toLowerCase();

    // 1. Can I take leave tomorrow?
    if (lower.includes('tomorrow') || lower.includes('leave') || lower.includes('bunk')) {
      const tom = getTomorrowSchedule();
      if (tom.day === 'Saturday' || tom.day === 'Sunday') {
        return `Tomorrow is ${tom.day}, which is a weekend with no scheduled classes. Taking leave will have zero impact on your attendance.`;
      }

      if (tom.slots.length === 0) {
        return `Tomorrow is ${tom.day}, and your section has no classes scheduled in the timetable. Your attendance will remain unaffected.`;
      }

      const count = tom.slots.length;
      const curAttended = overall.totalAttended;
      const curConducted = overall.totalConducted;
      const newConducted = curConducted + count;
      const newAttended = curAttended;
      const newPct = newConducted > 0 ? ((newAttended / newConducted) * 100).toFixed(1) : '100.0';
      const curPct = overall.overallPercentage !== null ? overall.overallPercentage.toFixed(1) : '100.0';

      const subjectNames = tom.slots
        .map((s) => selectedSection.subjects[s.subjectId]?.name || s.subjectId)
        .slice(0, 3)
        .join(', ');

      let advice = '';
      if (parseFloat(newPct) < 75) {
        advice = `Missing tomorrow drops your attendance into the DETENTION ZONE (< 75%). We strongly advise attending tomorrow.`;
      } else if (parseFloat(newPct) < 90) {
        advice = `Missing tomorrow drops your attendance below your 90% Safe Target.`;
      } else {
        advice = `Your attendance will stay safely in the SAFE ZONE (≥ 90%) even if you take leave tomorrow.`;
      }

      return `Tomorrow (${tom.day}) has ${count} scheduled classes, including ${subjectNames}.\n\nIf you miss tomorrow, your attendance drops from ${curPct}% to ${newPct}%.\n\n${advice}\n\nNote: If this leave is for official college events or medical reasons, submitting an On Duty (OD) or Medical Leave request will count those periods as attended.`;
    }

    // 2. Reach 75% / Detention Recovery
    if (lower.includes('75%') || lower.includes('reach 75') || lower.includes('detention') || lower.includes('recover')) {
      const detentionSubjects = predictions.filter(
        (p) => p.status === 'DETENTION' || p.status === 'IRREVERSIBLE_DETENTION'
      );

      if (overall.overallPercentage !== null && overall.overallPercentage >= 75 && detentionSubjects.length === 0) {
        return `You are already above the 75% mandatory threshold in all subjects with an overall attendance of ${overall.overallPercentage.toFixed(1)}%.\n\nYour primary focus now is maintaining or reaching the 90% Safe Target.`;
      }

      const lines: string[] = [];
      lines.push(`Overall Attendance: ${overall.overallPercentage !== null ? `${overall.overallPercentage.toFixed(1)}%` : 'No data'}`);
      lines.push(`Remaining Classes: ${overall.totalRemainingClasses} classes`);

      predictions.forEach((p) => {
        if (p.currentPercentage !== null && p.currentPercentage < 75) {
          if (p.status === 'IRREVERSIBLE_DETENTION') {
            lines.push(`${p.subject.name}: IRREVERSIBLE DETENTION (Max possible: ${p.maxPossiblePercentage.toFixed(1)}%)`);
          } else {
            lines.push(`${p.subject.name}: Need ${p.requiredFor75} of ${p.remainingClasses} remaining classes`);
          }
        }
      });

      return `To recover from the detention zone and clear your courses for semester exams, review your subject recovery requirements below:\n\n${lines.join('\n')}\n\nRemember that any valid On Duty (OD) or Medical leaves count toward your attended classes.`;
    }

    // 3. How many classes can I miss? / 90% Safe Target
    if (lower.includes('miss') || lower.includes('90') || lower.includes('safe') || lower.includes('margin')) {
      let totalMissable = 0;
      const lines: string[] = [];

      predictions.forEach((p) => {
        if (p.conducted > 0) {
          totalMissable += p.maxClassesMissable90;
          if (p.is90Possible && p.requiredFor90 !== null) {
            lines.push(`${p.subject.name}: Can miss up to ${p.maxClassesMissable90} classes (Need ${p.requiredFor90} of ${p.remainingClasses})`);
          } else {
            lines.push(`${p.subject.name}: 90% is mathematically unachievable (Max possible: ${p.maxPossiblePercentage.toFixed(1)}%)`);
          }
        }
      });

      return `To maintain your 90% Safe Target across the semester, you have a combined buffer of ${totalMissable} safe absences across your enrolled courses.\n\n${lines.join('\n')}`;
    }

    // 4. Upcoming classes
    if (lower.includes('upcoming') || lower.includes('schedule') || lower.includes('next')) {
      const tom = getTomorrowSchedule();
      const slotList =
        tom.slots.length > 0
          ? tom.slots.map((s) => `Period ${s.period}: ${selectedSection.subjects[s.subjectId]?.name || s.subjectId}`).join('\n')
          : 'No scheduled classes (Weekend or Holiday)';

      return `You have ${overall.totalRemainingClasses} classes scheduled between now and ${planUntilDate} (${daysRemaining} calendar days left).\n\nTomorrow's Schedule (${tom.day}):\n${slotList}\n\nYou can view the full weekly timetable in the Class Timetable tab.`;
    }

    // 5. Default comprehensive analysis
    const lines: string[] = [];
    lines.push(`Overall Attendance: ${overall.overallPercentage !== null ? `${overall.overallPercentage.toFixed(1)}%` : 'No data'}`);
    lines.push(`Total Classes: ${overall.totalAttended} attended of ${overall.totalConducted} conducted`);
    lines.push(`Present Details: ${overall.totalRegularPresent} present, ${overall.totalOD} OD, ${overall.totalMedical} medical leave`);
    lines.push(`Absences: ${overall.totalAbsent} missed classes`);
    lines.push(`Remaining Classes: ${overall.totalRemainingClasses} classes`);

    let statusRemark = 'Your attendance is in the SAFE ZONE.';
    if (overall.overallStatus === 'IRREVERSIBLE_DETENTION') {
      statusRemark = 'You are flagged for IRREVERSIBLE DETENTION in one or more courses.';
    } else if (overall.overallStatus === 'DETENTION') {
      statusRemark = 'You are currently in the DETENTION ZONE (< 75%). Prioritize attending all remaining classes to recover.';
    } else if (overall.overallStatus === 'AT_RISK') {
      statusRemark = 'You are AT RISK (75% - 89%). Aim to reach 90% for safe semester eligibility.';
    }

    return `Here is a summary of your attendance for section ${selectedSection.name}:\n\n${lines.join('\n')}\n\n${statusRemark}`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const tom = getTomorrowSchedule();
      const subjectBreakdowns = predictions.map((p) => ({
        subject: p.subject.name,
        code: p.subject.code,
        currentPct: p.currentPercentage,
        conducted: p.conducted,
        attended: p.attended,
        remaining: p.remainingClasses,
        need90: p.requiredFor90,
        missable90: p.maxClassesMissable90,
        need75: p.requiredFor75,
        status: p.status,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          selectedStudent,
          selectedSection: {
            name: selectedSection.name,
            year: selectedSection.year,
            semester: selectedSection.semester,
            venue: selectedSection.venue,
          },
          currentStats: {
            overallPercentage: overall.overallPercentage,
            overallStatus: overall.overallStatus,
            totalAttended: overall.totalAttended,
            totalConducted: overall.totalConducted,
            totalRegularPresent: overall.totalRegularPresent,
            totalOD: overall.totalOD,
            totalMedical: overall.totalMedical,
            totalAbsent: overall.totalAbsent,
            totalRemainingClasses: overall.totalRemainingClasses,
            subjectsBelow90Count: overall.subjectsBelow90Count,
            subjectsBelow75Count: overall.subjectsBelow75Count,
            irreversibleDetentionCount: overall.irreversibleDetentionCount,
          },
          subjectBreakdowns,
          upcomingClassesNextDays: [
            {
              day: tom.day,
              date: tom.dateStr,
              slots: tom.slots.map((s) => ({ period: s.period, subject: s.subjectId })),
            },
          ],
          daysRemaining,
          effectiveStartDate,
          planUntilDate,
          chatHistory: messages.slice(-6),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Server chat route fallback to analytical engine:', err);
    }

    // Fallback to local analytical engine
    const fallbackAnswer = generateAnalyticalResponse(query);
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fallbackAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsLoading(false);
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. I am ready to answer your attendance and timetable questions for ${selectedSection.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center gap-2.5 font-semibold text-xs transition-all hover:scale-105 cursor-pointer ring-4 ring-indigo-950/80 border border-indigo-400/30"
          title="Open Attendance Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-indigo-600" />
          </div>
          <span>Attendance Assistant</span>
        </button>
      )}

      {/* Modern Polished Chat Drawer */}
      {isOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[86vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white truncate">
                    Attendance Assistant
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {selectedStudent ? `${selectedStudent.name}` : selectedSection.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleClearConversation}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 text-[11px] shrink-0 scrollbar-none">
            <button
              onClick={() => handleSendMessage('Can I take leave tomorrow?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white whitespace-nowrap cursor-pointer transition-colors"
            >
              Leave Tomorrow?
            </button>
            <button
              onClick={() => handleSendMessage('How many classes can I miss?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white whitespace-nowrap cursor-pointer transition-colors"
            >
              Classes I Can Miss
            </button>
            <button
              onClick={() => handleSendMessage('How do I recover above 75%?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-amber-300 hover:text-amber-200 whitespace-nowrap cursor-pointer transition-colors"
            >
              75% Recovery
            </button>
            <button
              onClick={() => handleSendMessage('What is needed to reach 90%?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-emerald-300 hover:text-emerald-200 whitespace-nowrap cursor-pointer transition-colors"
            >
              Reach 90%
            </button>
            <button
              onClick={() => handleSendMessage('Give me a full attendance summary')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-indigo-300 hover:text-indigo-200 whitespace-nowrap cursor-pointer transition-colors"
            >
              Full Summary
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-indigo-400 border border-slate-700'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={`p-3.5 rounded-2xl ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                          : 'bg-slate-950 border border-slate-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-white text-[12.5px] leading-relaxed">{m.content}</p>
                      ) : (
                        <FormattedChatResponse content={m.content} />
                      )}
                    </div>

                    <span
                      className={`block text-[10px] font-mono px-1 text-slate-500 ${
                        isUser ? 'text-right' : 'text-left'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Polished Minimal Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs w-fit rounded-tl-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-300" />
                </div>
                <span className="text-[11.5px] text-slate-400 font-medium">
                  Analyzing timetable schedule...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask an attendance question..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-colors shadow-sm shrink-0"
              title="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
