import { useMemo, useState, useEffect, useCallback } from "react";
import { getLecturerTimetable, getLecturerSemesterWeeks, getLecturerCalendarBlocks } from "../../../services/lecturerTimetableApi";
import { lecturerCourseSectionApi } from "../../../api/lecturerCourseSectionApi";
import { useAcademicWeeks } from "../../../hooks/useAcademicWeeks";
import {
  buildTimeAxis,
  getHeightByTime,
  getTopByTime,
  getWeekDatesFromMonday,
  isTimeInsideGrid,
  ROW_HEIGHT,
} from "../../../utils/timetableTimeUtils";

const timeSlots = buildTimeAxis();
const rowCount = Math.max(timeSlots.length - 1, 0);
const gridHeight = rowCount * ROW_HEIGHT;

const coursePalette = [
  { bg: "bg-sky-50", border: "border-sky-200", accent: "border-l-sky-400", text: "text-sky-900" },
  { bg: "bg-emerald-50", border: "border-emerald-200", accent: "border-l-emerald-400", text: "text-emerald-900" },
  { bg: "bg-amber-50", border: "border-amber-200", accent: "border-l-amber-400", text: "text-amber-900" },
  { bg: "bg-rose-50", border: "border-rose-200", accent: "border-l-rose-400", text: "text-rose-900" },
  { bg: "bg-indigo-50", border: "border-indigo-200", accent: "border-l-indigo-400", text: "text-indigo-900" },
  { bg: "bg-teal-50", border: "border-teal-200", accent: "border-l-teal-400", text: "text-teal-900" },
  { bg: "bg-lime-50", border: "border-lime-200", accent: "border-l-lime-400", text: "text-lime-900" },
];

const timetableColumns = "42px repeat(7, minmax(110px, 1fr)) 42px";

const formatDateFull = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function LecturerWeeklySchedule({ showCancelled = true }) {
  const fetchSemesters = useCallback(() => lecturerCourseSectionApi.getSemesters(), []);
  const fetchWeeks = useCallback((semId) => getLecturerSemesterWeeks(semId), []);
  const fetchCalendarBlocks = useCallback((semId) => getLecturerCalendarBlocks(semId), []);

  const {
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    semesterWeeks,
    selectedWeekIndex,
    setSelectedWeekIndex,
    selectedWeek,
    calendarBlocks,
    loading: weeksLoading,
    errorMessage: weeksErrorMessage,
    weekDates,
    weekDays,
    handlePreviousWeek,
    handleNextWeek,
  } = useAcademicWeeks({
    fetchSemesters,
    fetchWeeks,
    fetchCalendarBlocks,
  });

  const [timetableItems, setTimetableItems] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableError, setTimetableError] = useState("");

  const loading = weeksLoading || timetableLoading;
  const errorMessage = weeksErrorMessage || timetableError;

  // Fetch timetable when week changes
  useEffect(() => {
    async function fetchTimetable() {
      if (!selectedWeek) return;

      const fromDate = weekDates[0] ? formatDateToISO(weekDates[0]) : selectedWeek.startDate;
      const toDate = weekDates[6] ? formatDateToISO(weekDates[6]) : selectedWeek.endDate;

      try {
        setTimetableLoading(true);
        setTimetableError("");

        const raw = await getLecturerTimetable(fromDate, toDate);
        const items = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        setTimetableItems(items);
      } catch (error) {
        console.error("Lỗi tải lịch giảng dạy:", error);
        setTimetableItems([]);
        setTimetableError("Không thể tải lịch giảng dạy.");
      } finally {
        setTimetableLoading(false);
      }
    }
    fetchTimetable();
  }, [selectedWeek, weekDates]);

  const courseColors = useMemo(() => {
    const map = {};
    let paletteIndex = 0;
    const items = Array.isArray(timetableItems) ? timetableItems : [];
    items.forEach((item) => {
      const key = item.courseCode ?? item.courseName ?? item.sectionId ?? item.sessionId;
      if (!map[key]) {
        map[key] = coursePalette[paletteIndex % coursePalette.length];
        paletteIndex += 1;
      }
    });
    return map;
  }, [timetableItems]);

  const getBlockStyle = (startTime, endTime) => {
    const top = Math.max(getTopByTime(startTime), 0);
    const height = getHeightByTime(startTime, endTime);

    // UI kiểu thời khóa biểu trường: phủ luôn ô mang nhãn giờ kết thúc
    const visualHeight = height + ROW_HEIGHT;

    return {
      top,
      height: Math.min(
        Math.max(visualHeight, ROW_HEIGHT),
        gridHeight - top
      ),
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Filter toolbar */}
      <div className="bg-white border-y border-x border-[#1E3A8A] rounded-lg py-4 px-3">
        <div className="flex flex-col gap-2 max-w-[920px]">
          <div className="grid grid-cols-1 md:grid-cols-[330px_445px] gap-3">
            {semesters.length === 0 && !loading ? (
              <div className="text-sm text-gray-500 flex items-center h-11 px-3 border border-gray-300 rounded-lg bg-gray-50">
                Không có dữ liệu học kỳ.
              </div>
            ) : (
              <select
                value={selectedSemesterId || ""}
                onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 font-medium"
              >
                {Array.isArray(semesters) &&
                  semesters.map((s) => (
                    <option key={s.semesterId ?? s.id} value={s.semesterId ?? s.id}>
                      {s.semesterName || s.semesterCode || s.name || `${s.semesterCode} - ${s.semesterYear}`}
                    </option>
                  ))}
              </select>
            )}
            
            <div className="flex items-center text-sm font-semibold text-[#1E3A8A] border border-blue-100 rounded-lg px-3 bg-blue-50/50">
              Lịch Giảng Dạy Giảng Viên
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[720px_auto] gap-6 items-center">
            {semesterWeeks.length === 0 && !loading ? (
              <div className="text-sm text-gray-500 flex items-center h-11 w-full px-3 border border-gray-300 rounded-lg bg-gray-50">
                Không có dữ liệu tuần học.
              </div>
            ) : (
              <select
                value={selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                {Array.isArray(semesterWeeks) &&
                  semesterWeeks.map((week, index) => (
                    <option key={week.semesterWeekId} value={index}>
                      Tuần {week.weekNo} [từ ngày {formatDateFull(new Date(`${week.startDate}T00:00:00`))} đến ngày {formatDateFull(new Date(`${week.endDate}T00:00:00`))}]
                    </option>
                  ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="h-11 px-6 rounded-lg border border-blue-500 text-blue-600 hover:bg-[#1E3A8A] hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <span className="text-lg">🖨</span>
              <span>In</span>
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Đang tải...</div>}
      {!loading && errorMessage && <div className="text-sm text-rose-600 font-semibold">{errorMessage}</div>}
      {!loading && !errorMessage && timetableItems.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
          Chưa có lịch giảng dạy trong tuần này.
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border-y border-x border-[#1E3A8A] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="relative">
            <button
              type="button"
              onClick={handlePreviousWeek}
              className="absolute left-1 top-1/2 z-30 h-8 w-8 -translate-y-1/2 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center rounded-full shadow-md bg-white border border-gray-200 hover:text-blue-600 transition-all duration-200"
            >
              <span className="text-2xl">←</span>
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="absolute right-1 top-1/2 z-30 h-8 w-8 -translate-y-1/2 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center rounded-full shadow-md bg-white border border-gray-200 hover:text-blue-600 transition-all duration-200"
            >
              <span className="text-2xl">→</span>
            </button>

            <div className="grid border-b border-gray-300 bg-white" style={{ gridTemplateColumns: timetableColumns }}>
              <div className="h-12 border-r border-gray-300 bg-white" />
              {weekDays.map((day) => (
                <div key={day.dateString} className="h-12 flex items-center justify-center border-r border-gray-300 text-sm font-semibold text-gray-800">
                  <span>{day.label}</span>
                  <span className="ml-1 text-gray-500 font-normal">({formatDate(day.date)})</span>
                </div>
              ))}
              <div className="h-12 bg-white" />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: timetableColumns }}>
            {/* Left Time Axis */}
            <div className="relative bg-[#1E3A8A] text-white border-r border-sky-600" style={{ height: gridHeight }}>
              {timeSlots.slice(0, -1).map((time, index) => (
                <div key={time} className="flex items-center justify-center border-b border-white/25 text-xs font-semibold" style={{ height: `${ROW_HEIGHT}px` }}>
                  {time}
                </div>
              ))}
            </div>

            {/* Schedule Columns for each day */}
            {weekDays.map((day) => {
              const dayItems = timetableItems.filter((item) => {
                const status = String(item.sessionStatus ?? item.status ?? "").toLowerCase();
                if (!showCancelled && status === "cancelled") return false;
                return item.sessionDate === day.dateString && isTimeInsideGrid(item.startTime) && isTimeInsideGrid(item.endTime);
              });

              // Check if this day falls within any calendar block with teachingAllowed = false
              const dayBlock = calendarBlocks.find((block) => {
                const start = block.startDate || block.fromDate;
                const end = block.endDate || block.toDate;
                const allowed = block.teachingAllowed ?? block.allowTeaching ?? block.allow_teaching;
                return day.dateString >= start && day.dateString <= end && !allowed;
              });

              return (
                <div key={day.label} className="relative border-r border-gray-300 bg-white" style={{ height: gridHeight }}>
                  <div className="grid" style={{ gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)` }}>
                    {Array.from({ length: rowCount }).map((_, index) => (
                      <div key={`${day.label}-row-${index}`} className="border-b border-gray-200" />
                    ))}
                  </div>

                  {dayItems.map((item) => {
                    const colorKey = item.courseName ?? item.sectionId ?? item.sessionId;
                    const palette = courseColors[colorKey] || coursePalette[0];
                    const status = String(item.sessionStatus ?? item.status ?? "").toLowerCase();
                    const isCancelled = status === "cancelled" || status === "canceled";
                    const isOff = isCancelled || !!dayBlock;
                    const offTitle = dayBlock?.title || item.cancellationReason || "Nghỉ lễ";
                    const offNote = dayBlock?.note || item.note || "";
                    const { top, height } = getBlockStyle(item.startTime, item.endTime);
                    const fullOffNote = `Ghi chú: ${offTitle}${offNote ? ` - ${offNote}` : ""}`;

                    const isPractice = item.practice || item.sessionType === "PRACTICE";
                    const practiceGroupNo = Number(item.practiceGroupNo || item.practice_group_no || 0);
                    const slotStart = item.slotStart || "";
                    const slotEnd = item.slotEnd || "";

                    return (
                      <div
                        key={item.sessionId}
                        className={`group absolute left-2 right-2 rounded-md border border-l-4 shadow-md px-3 py-2 session-card transition-all duration-200 hover:shadow-lg ${isOff
                          ? "bg-rose-50/95 border-rose-300 border-l-rose-500 text-rose-950 hover:bg-rose-100/95"
                          : `${palette.bg} ${palette.border} ${palette.accent} ${palette.text} hover:scale-[1.01]`
                          }`}
                        style={{ top, height }}
                      >
                        <div className="text-xs leading-snug flex flex-col h-full justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="truncate pr-1">
                                <p className="font-bold text-sm truncate" title={item.courseName}>
                                  {item.courseName}
                                </p>
                                <p className="font-semibold text-[10px] opacity-80 mt-0.5">
                                  {item.courseCode}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              {/* Session Type Badge */}
                              {isPractice ? (
                                <span className="shrink-0 rounded bg-orange-100/80 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 border border-orange-200/50">
                                  Thực hành
                                </span>
                              ) : (
                                <span className="shrink-0 rounded bg-sky-100/80 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 border border-sky-200/50">
                                  Lý thuyết
                                </span>
                              )}
                            </div>

                            <div className="mt-2 space-y-0.5 text-[11px] opacity-90 font-medium">
                              <p className="truncate">
                                Nhóm/Lớp: <span className="font-bold">{item.sectionCode || item.groupName || "N/A"}</span>
                              </p>
                              {item.groupName && item.groupName !== item.sectionCode && (
                                <p className="truncate">
                                  Nhóm: <span className="font-bold">{item.groupName}</span>
                                </p>
                              )}
                              <p className="truncate">
                                Phòng: <span className="font-bold text-sky-800">{item.roomCode || item.roomName || "N/A"}</span>
                              </p>
                              {(slotStart || slotEnd) && (
                                <p className="truncate">
                                  Tiết: <span className="font-bold">{slotStart}-{slotEnd}</span>
                                </p>
                              )}
                              {isPractice && practiceGroupNo > 0 && (
                                <p className="truncate font-semibold text-orange-700">
                                  Nhóm TH: <span className="font-bold">{practiceGroupNo}</span>
                                </p>
                              )}
                              {/* 'Nghỉ' Badge */}
                              {isOff && (
                                <span className="shrink-0 inline-block mt-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200/80 uppercase tracking-wide animate-pulse">
                                  Nghỉ
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="group overflow-visible hover:z-[999] mt-2 pt-1 border-t border-dashed border-gray-200/50">
                            {/* Note in class block if holiday/cancelled */}
                            {isOff && (
                              <div className="pointer-events-none absolute left-[calc(100%-10px)] bottom-3 z-[999] hidden group-hover:block">
                                <div className="w-[260px] max-h-[120px] overflow-y-auto rounded-lg border border-red-200 bg-white px-3 py-2 text-left text-xs leading-relaxed text-red-900 shadow-xl">
                                  {fullOffNote}
                                </div>
                              </div>
                            )}
                            <p className="text-[10px] font-bold opacity-75">{item.startTime} - {item.endTime}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Right Time Axis */}
            <div className="relative bg-[#1E3A8A] text-white border-l border-sky-600" style={{ height: gridHeight }}>
              {timeSlots.slice(0, -1).map((time, index) => (
                <div key={time} className="flex items-center justify-center border-b border-white/25 text-xs font-semibold" style={{ height: `${ROW_HEIGHT}px` }}>
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
