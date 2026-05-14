import { useMemo, useState, useEffect } from "react";
import { getLecturerTimetable } from "../../../services/lecturerTimetableApi";
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

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function LecturerWeeklySchedule({ showCancelled = true }) {
  const [currentDate, setCurrentDate] = useState(() => getWeekDatesFromMonday(new Date())[0] || new Date());
  const [timetableItems, setTimetableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const weekDates = useMemo(() => {
    return getWeekDatesFromMonday(currentDate);
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const labels = [
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
      "Chủ nhật",
    ];

    return labels.map((label, index) => {
      const baseDate = weekDates[index] || weekDates[0] || new Date();
      const date = addDays(baseDate, index);

      return {
        index,
        label,
        date,
        dateString: formatDateToISO(date),
      };
    });
  }, [weekDates]);

  useEffect(() => {
    async function fetchTimetable() {
      const fromDate = weekDates[0] ? formatDateToISO(weekDates[0]) : null;
      const toDate = weekDates[6] ? formatDateToISO(weekDates[6]) : null;

      if (!fromDate || !toDate) return;

      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getLecturerTimetable(fromDate, toDate);
        setTimetableItems(data);
      } catch (error) {
        console.error("Lỗi tải lịch giảng dạy:", error);
        setErrorMessage("Không thể tải lịch giảng dạy.");
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, [weekDates]);

  const courseColors = useMemo(() => {
    const map = {};
    let paletteIndex = 0;

    timetableItems.forEach((item) => {
      const key = item.courseCode ?? item.courseName ?? item.sectionId ?? item.sessionId;

      if (!map[key]) {
        map[key] = coursePalette[paletteIndex % coursePalette.length];
        paletteIndex += 1;
      }
    });

    return map;
  }, [timetableItems]);

  const getBlockStyle = (startTime, endTime) => {
    const top = getTopByTime(startTime);
    const height = getHeightByTime(startTime, endTime);

    return {
      top: Math.max(top, 0),
      height: Math.max(height, ROW_HEIGHT),
    };
  };

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Filter toolbar */}
      <div className="bg-white border-y border-x border-[#1E3A8A] rounded-lg py-4 px-3">
        <div className="flex flex-col gap-2 max-w-[920px]">
          <div className="grid grid-cols-1 md:grid-cols-[720px_auto] gap-6 items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Tuần: {formatDateFull(weekDates[0] || new Date())} -{" "}
                {formatDateFull(weekDates[6] || new Date())}
              </p>
              <select
                value={formatDateToISO(currentDate)}
                onChange={(e) => {
                  const selectedDate = new Date(`${e.target.value}T00:00:00`);
                  const mondayOfWeek = getWeekDatesFromMonday(selectedDate)[0];
                  setCurrentDate(mondayOfWeek);
                }}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                {Array.from({ length: 52 }).map((_, weekIndex) => {
                  const baseDate = new Date(weekDates[0] || new Date());
                  const weekStart = addDays(baseDate, weekIndex * 7);
                  const weekEnd = addDays(weekStart, 6);
                  const startISO = formatDateToISO(weekStart);
                  const currentISO = formatDateToISO(currentDate);

                  return (
                    <option key={weekIndex} value={startISO}>
                      Tuần {weekIndex + 1} [từ {formatDateFull(weekStart)} đến{" "}
                      {formatDateFull(weekEnd)}]
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-11 px-6 rounded-lg border border-blue-500 text-blue-600 hover:bg-[#1E3A8A] hover:text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              <span className="text-lg">🖨</span>
              <span>In</span>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Đang tải lịch giảng dạy...</div>
      )}
      {!loading && errorMessage && (
        <div className="text-sm text-rose-600">{errorMessage}</div>
      )}
      {!loading && !errorMessage && timetableItems.length === 0 && (
        <div className="text-sm text-gray-500">Không có lịch giảng dạy trong tuần này.</div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border-y border-x border-[#1E3A8A] overflow-hidden">
        <div className="overflow-x-auto">
          {/* Header row */}
          <div className="relative">
            {/* Arrow buttons */}
            <button
              type="button"
              onClick={handlePreviousWeek}
              className="absolute left-1 top-1/2 z-30 h-8 w-8 -translate-y-1/2 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center leading-none"
            >
              <span className="block text-2xl leading-none -translate-y-[1px]">
                ←
              </span>
            </button>

            <button
              type="button"
              onClick={handleNextWeek}
              className="absolute right-1 top-1/2 z-30 h-8 w-8 -translate-y-1/2 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center leading-none"
            >
              <span className="block text-2xl leading-none -translate-y-[1px]">
                →
              </span>
            </button>

            {/* Header grid */}
            <div
              className="grid border-b border-gray-300 bg-white"
              style={{
                gridTemplateColumns: timetableColumns,
              }}
            >
              <div className="h-12 border-r border-gray-300 bg-white" />

              {weekDays.map((day) => (
                <div
                  key={day.dateString}
                  className="h-12 flex items-center justify-center border-r border-gray-300 text-sm font-semibold text-gray-800"
                >
                  <span>{day.label}</span>
                  <span className="ml-1 text-gray-500 font-normal">
                    ({formatDate(day.date)})
                  </span>
                </div>
              ))}

              <div className="h-12 bg-white" />
            </div>
          </div>

          {/* Body grid */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: timetableColumns,
            }}
          >
            {/* Left time axis */}
            <div
              className="relative bg-[#1E3A8A] text-white sm border-r border-sky-600"
              style={{ height: gridHeight }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)`,
                }}
              >
                {Array.from({ length: rowCount }).map((_, index) => (
                  <div
                    key={`time-line-${index}`}
                    className="border-b border-white/25"
                  />
                ))}
              </div>

              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className="absolute left-0 right-0 text-center text-sm font-semibold"
                  style={{
                    top: index * ROW_HEIGHT + ROW_HEIGHT / 2,
                    transform: "translateY(-50%)",
                  }}
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayItems = timetableItems.filter((item) => {
                const status = String(item.sessionStatus ?? item.status ?? "").toLowerCase();
                if (!showCancelled && status === "cancelled") return false;
                return (
                  item.sessionDate === day.dateString &&
                  isTimeInsideGrid(item.startTime) &&
                  isTimeInsideGrid(item.endTime)
                );
              });

              return (
                <div
                  key={day.label}
                  className="relative border-r border-gray-300 bg-white"
                  style={{ height: gridHeight }}
                >
                  {/* Horizontal grid lines */}
                  <div
                    className="grid"
                    style={{
                      gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)`,
                    }}
                  >
                    {Array.from({ length: rowCount }).map((_, index) => (
                      <div
                        key={`${day.label}-row-${index}`}
                        className="border-b border-gray-200"
                      />
                    ))}
                  </div>

                  {/* Course blocks */}
                  {dayItems.map((item) => {
                    const colorKey =
                      item.courseName ?? item.sectionId ?? item.sessionId;
                    const palette = courseColors[colorKey] || coursePalette[0];
                    const status = String(
                      item.sessionStatus ?? item.status ?? ""
                    ).toLowerCase();
                    const isCancelled =
                      status === "cancelled" || status === "canceled";

                    const { top, height } = getBlockStyle(
                      item.startTime,
                      item.endTime
                    );

                    const isPractice =
                      item.practice || item.sessionType === "PRACTICE";
                    const practiceGroupNo = Number(
                      item.practiceGroupNo || item.practice_group_no || 0
                    );
                    const slotStart = item.slotStart || "";
                    const slotEnd = item.slotEnd || "";

                    return (
                      <div
                        key={item.sessionId}
                        className={`
                          absolute left-2 right-2 z-10
                          rounded-sm border border-l-4 shadow-sm
                          px-3 py-2 overflow-hidden
                          ${
                            isCancelled
                              ? "bg-rose-50 border-rose-200 border-l-rose-400 text-rose-900"
                              : palette.bg
                          }
                          ${
                            isCancelled
                              ? "border-rose-200"
                              : palette.border
                          }
                          ${
                            isCancelled
                              ? "border-l-rose-400"
                              : palette.accent
                          }
                          ${isCancelled ? "text-rose-900" : palette.text}
                        `}
                        style={{ top, height }}
                      >
                        <div className="text-sm leading-snug">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold">
                                {item.courseName}
                              </p>
                              <p className="font-semibold">
                                ({item.courseCode})
                              </p>
                            </div>

                            {isPractice && (
                              <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                                Thực hành
                              </span>
                            )}

                            {isCancelled && (
                              <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                Nghỉ
                              </span>
                            )}
                          </div>

                          <p className="text-xs mt-1">
                            Lớp:{" "}
                            <span className="font-semibold">
                              {item.sectionCode || item.groupName || "N/A"}
                            </span>
                          </p>

                          {item.groupName && item.groupName !== item.sectionCode && (
                            <p className="text-xs">
                              Nhóm:{" "}
                              <span className="font-semibold">
                                {item.groupName}
                              </span>
                            </p>
                          )}

                          <p className="text-xs">
                            Phòng:{" "}
                            <span className="font-semibold">
                              {item.roomCode || item.roomName || "N/A"}
                            </span>
                          </p>

                          {(slotStart || slotEnd) && (
                            <p className="text-xs">
                              Tiết:{" "}
                              <span className="font-semibold">
                                {slotStart}-{slotEnd}
                              </span>
                            </p>
                          )}

                          <p className="mt-1 text-xs opacity-80">
                            {item.startTime} - {item.endTime}
                          </p>

                          {isPractice && practiceGroupNo > 0 && (
                            <p className="text-xs mt-1 font-semibold opacity-90">
                              Nhóm thực hành: {practiceGroupNo}
                            </p>
                          )}

                          {item.note && (
                            <p className="mt-1 text-xs opacity-80">
                              {item.note}
                            </p>
                          )}

                          {isCancelled && item.cancellationReason && (
                            <p className="mt-1 text-xs opacity-80">
                              {item.cancellationReason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Right blue strip */}
            <div
              className="relative bg-[#1E3A8A] text-white sm border-r border-sky-600"
              style={{ height: gridHeight }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)`,
                }}
              >
                {Array.from({ length: rowCount }).map((_, index) => (
                  <div
                    key={`time-line-${index}`}
                    className="border-b border-white/25"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer with navigation arrows */}
          <div className="relative">
            <button
              type="button"
              onClick={handlePreviousWeek}
              className="absolute left-1 top-1/2 z-30 h-8 w-8 -translate-y-1/2 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center leading-none"
            >
              <span className="block text-2xl leading-none -translate-y-[1px]">
                ←
              </span>
            </button>

            <button
              type="button"
              onClick={handleNextWeek}
              className="absolute right-1 top-1/2 z-30 h-8 w-8 -translate-y-1/2 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center leading-none"
            >
              <span className="block text-2xl leading-none -translate-y-[1px]">
                →
              </span>
            </button>

            <div
              className="grid border-t border-gray-300 bg-white"
              style={{
                gridTemplateColumns: timetableColumns,
              }}
            >
              <div className="h-12 border-r border-gray-300 bg-white" />

              {weekDays.map((day) => (
                <div
                  key={`footer-${day.dateString}`}
                  className="h-12 flex items-center justify-center border-r border-gray-300 text-sm font-semibold text-gray-800"
                >
                  <span>{day.label}</span>
                  <span className="ml-1 text-gray-500 font-normal">
                    ({formatDate(day.date)})
                  </span>
                </div>
              ))}

              <div className="h-12 bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
