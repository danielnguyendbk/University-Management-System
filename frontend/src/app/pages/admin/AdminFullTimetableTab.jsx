import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getBuildings,
  getCourseSections,
  getFullTimetable,
  getRooms,
  getSemesterWeeks,
  getSemesters,
} from "../../../api/adminTimetableApi";
import {
  buildTimeAxis,
  getHeightByTime,
  getTopByTime,
  isTimeInsideGrid,
  ROW_HEIGHT,
} from "../../../utils/timetableTimeUtils";
import { getLatestSemester } from "../../../utils/semesterUtils";

const breakRanges = [
  { start: "11:00", end: "13:00" },
  { start: "17:00", end: "17:30" },
];

const DAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const normalizeSessionStatus = (session) =>
  String(session?.sessionStatus ?? session?.status ?? "scheduled").toLowerCase();

const statusStyles = {
  scheduled: { bg: "bg-sky-50", text: "text-sky-900", border: "border-sky-200", label: "Đã lên lịch" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-900", border: "border-rose-200", label: "Nghỉ" },
  makeup: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200", label: "Học bù" },
  rescheduled: { bg: "bg-violet-50", text: "text-violet-900", border: "border-violet-200", label: "Dời lịch" },
};

const timeAxis = buildTimeAxis();
const rowCount = Math.max(timeAxis.length - 1, 0);
const gridHeight = rowCount * ROW_HEIGHT;

/** Derive the 7 dates of a week given startDate (Mon) string "YYYY-MM-DD" */
function getWeekDates(startDate) {
  if (!startDate) return [];
  const base = new Date(`${startDate}T00:00:00`);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
  });
}

/** Format "YYYY-MM-DD" → "dd/MM" */
function formatShort(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** Format "YYYY-MM-DD" → "dd/MM/YYYY" */
function formatFull(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Group flat session rows → { buildingCode, buildingName, rooms: [{ roomCode, sessions }] } */
function groupByBuildingRoom(sessions = []) {
  const buildingMap = new Map();
  for (const s of sessions) {
    const bk = s.buildingCode ?? "UNKNOWN";
    if (!buildingMap.has(bk)) {
      buildingMap.set(bk, { buildingCode: s.buildingCode, buildingName: s.buildingName, roomMap: new Map() });
    }
    const b = buildingMap.get(bk);
    const rk = s.roomCode ?? "UNKNOWN";
    if (!b.roomMap.has(rk)) b.roomMap.set(rk, { roomCode: s.roomCode, sessions: [] });
    b.roomMap.get(rk).sessions.push(s);
  }
  return Array.from(buildingMap.values()).map((b) => ({
    buildingCode: b.buildingCode,
    buildingName: b.buildingName,
    rooms: Array.from(b.roomMap.values()),
  }));
}

export function AdminFullTimetableTab() {
  const [semesters, setSemesters] = useState([]);
  const [semesterWeeks, setSemesterWeeks] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);
  const [rawSessions, setRawSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedWeekNo, setSelectedWeekNo] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD"

  // Filters
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // ---------- Load semesters ----------
  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const data = await getSemesters();
        setSemesters(data || []);
        if (data?.length) {
          const latest = getLatestSemester(data);
          const id = latest?.semesterId ?? latest?.id;
          setSelectedSemesterId(id ? String(id) : "");
        }
      } catch { toast.error("Không thể tải học kỳ."); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  // ---------- Load weeks / buildings / rooms / sections ----------
  useEffect(() => {
    if (!selectedSemesterId) return;
    async function fetch() {
      try {
        setLoading(true);
        const [weeks, blds, rms, secs] = await Promise.all([
          getSemesterWeeks(selectedSemesterId),
          getBuildings(),
          getRooms(),
          getCourseSections(selectedSemesterId),
        ]);
        setSemesterWeeks(weeks || []);
        setBuildings(blds || []);
        setRooms(rms || []);
        setSections(secs || []);
        setSelectedBuildingId("");
        setSelectedRoomId("");
        setSelectedSectionId("");
        setSelectedLecturerId("");
        setSelectedDate("");
        if (weeks?.length) {
          setSelectedWeekNo(String(weeks[0].weekNo));
        }
      } catch { toast.error("Không thể tải dữ liệu học kỳ."); }
      finally { setLoading(false); }
    }
    fetch();
  }, [selectedSemesterId]);

  // ---------- Derived: selected week object ----------
  const selectedWeek = useMemo(
    () => semesterWeeks.find((w) => String(w.weekNo) === String(selectedWeekNo)),
    [semesterWeeks, selectedWeekNo]
  );

  // ---------- Week dates (7 items) ----------
  const weekDates = useMemo(() => getWeekDates(selectedWeek?.startDate), [selectedWeek]);

  // ---------- Auto-select date when week changes ----------
  useEffect(() => {
    if (!weekDates.length) return;
    const today = new Date().toISOString().slice(0, 10);
    if (weekDates.includes(today)) {
      setSelectedDate(today);
    } else {
      setSelectedDate(weekDates[0]);
    }
  }, [weekDates]);

  // ---------- Fetch timetable (full week) ----------
  useEffect(() => {
    if (!selectedSemesterId || !selectedWeekNo) return;
    async function fetch() {
      try {
        setLoading(true);
        const data = await getFullTimetable({
          semesterId: Number(selectedSemesterId),
          weekNo: Number(selectedWeekNo),
          buildingId: selectedBuildingId || undefined,
          roomId: selectedRoomId || undefined,
          sessionType: selectedSessionType || undefined,
          lecturerId: selectedLecturerId || undefined,
          sectionId: selectedSectionId || undefined,
        });
        setRawSessions(data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Không thể tải thời khóa biểu.");
      } finally { setLoading(false); }
    }
    fetch();
  }, [selectedSemesterId, selectedWeekNo, selectedBuildingId, selectedRoomId, selectedSessionType, selectedLecturerId, selectedSectionId]);

  // ---------- Auto-select date from data if no lịch hôm nay ----------
  useEffect(() => {
    if (!rawSessions.length || !weekDates.length) return;
    const today = new Date().toISOString().slice(0, 10);
    if (rawSessions.some((s) => s.sessionDate === today)) return;
    const firstDate = rawSessions.find((s) => weekDates.includes(s.sessionDate))?.sessionDate;
    if (firstDate && !weekDates.includes(today)) setSelectedDate(firstDate);
  }, [rawSessions, weekDates]);

  // ---------- Week navigation ----------
  const currentWeekIndex = semesterWeeks.findIndex((w) => String(w.weekNo) === String(selectedWeekNo));
  const canPrev = currentWeekIndex > 0;
  const canNext = currentWeekIndex < semesterWeeks.length - 1;
  const goWeek = (delta) => {
    const next = semesterWeeks[currentWeekIndex + delta];
    if (next) setSelectedWeekNo(String(next.weekNo));
  };

  // ---------- Derived ----------
  const hasFocusedFilter = Boolean(selectedLecturerId || selectedSectionId);

  const lecturers = useMemo(() => {
    const seen = new Set();
    return sections.filter((s) => s.lecturerId && !seen.has(s.lecturerId) && seen.add(s.lecturerId))
      .map((s) => ({ lecturerId: s.lecturerId, lecturerCode: s.lecturerCode, lecturerName: s.lecturerName }));
  }, [sections]);

  const selectedLecturer = useMemo(() => lecturers.find((l) => String(l.lecturerId) === String(selectedLecturerId)), [lecturers, selectedLecturerId]);
  const selectedSection = useMemo(() => sections.find((s) => String(s.sectionId) === String(selectedSectionId)), [sections, selectedSectionId]);

  // Filter sessions by selectedDate
  const dailySessions = useMemo(
    () => rawSessions.filter((s) => s.sessionDate === selectedDate),
    [rawSessions, selectedDate]
  );

  const buildingGroups = useMemo(() => groupByBuildingRoom(dailySessions), [dailySessions]);

  const filteredRooms = useMemo(
    () => rooms.filter((r) => !selectedBuildingId || String(r.buildingId) === String(selectedBuildingId)),
    [rooms, selectedBuildingId]
  );

  // ---------- Titles ----------
  const getCardTitle = (building) => {
    if (selectedLecturerId && selectedSectionId) return "Lịch theo bộ lọc đã chọn";
    if (selectedLecturerId && selectedLecturer) return `Lịch của ${selectedLecturer.lecturerCode} - ${selectedLecturer.lecturerName}`;
    if (selectedSectionId && selectedSection) return `Lịch lớp ${selectedSection.sectionCode}`;
    return `${building.buildingName || building.buildingCode} — ${building.rooms.length} phòng`;
  };

  const dayLabelForDate = (iso) => {
    if (!weekDates.length) return "";
    const idx = weekDates.indexOf(iso);
    return idx >= 0 ? `${DAY_LABELS[idx]}, ${formatFull(iso)}` : formatFull(iso);
  };

  // ---------- Renderers ----------
  const renderSessionCard = (session) => {
    if (!isTimeInsideGrid(session.startTime) || !isTimeInsideGrid(session.endTime)) return null;
    const status = normalizeSessionStatus(session);
    const style = statusStyles[status] || statusStyles.scheduled;
    const top = getTopByTime(session.startTime);
    const h = Math.min(getHeightByTime(session.startTime, session.endTime) + ROW_HEIGHT, gridHeight - top);
    const practiceGroupNo = Number(session.practiceGroupNo ?? 0);

    return (
      <div
        key={session.sessionId ?? `${session.courseCode}-${session.startTime}`}
        className={`absolute left-1 right-1 rounded-md border shadow-sm px-2 py-1.5 overflow-hidden ${style.bg} ${style.text} ${style.border}`}
        style={{ top, height: h }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{session.courseCode}</div>
        <div className="text-xs font-semibold leading-tight">{session.courseName}</div>
        <div className="text-[11px] text-gray-600">{session.sectionCode}</div>
        <div className="text-[11px] text-gray-600">{session.lecturerName}</div>
        {hasFocusedFilter && (
          <div className="text-[11px] text-gray-500">{session.roomCode}{session.buildingName ? ` · ${session.buildingName}` : ""}</div>
        )}
        <div className="mt-1 text-[11px] font-medium">{session.startTime?.slice(0, 5)} – {session.endTime?.slice(0, 5)}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold text-gray-700">{style.label}</span>
          {session.sessionType && (
            <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold text-gray-700">
              {session.sessionType === "PRACTICE" ? "TH" : "LT"}
            </span>
          )}
          {practiceGroupNo > 0 && (
            <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold text-gray-700">Nhóm TH: {practiceGroupNo}</span>
          )}
        </div>
      </div>
    );
  };

  const renderRoomColumn = (room) => (
    <div key={room.roomCode} className="relative border-r border-gray-200" style={{ height: gridHeight }}>
      <div className="grid" style={{ gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)` }}>
        {Array.from({ length: rowCount }).map((_, i) => <div key={i} className="border-b border-gray-100" />)}
      </div>
      {breakRanges.map((r) => (
        <div key={r.start} className="absolute inset-x-0 bg-slate-50/80"
          style={{ top: getTopByTime(r.start), height: getHeightByTime(r.start, r.end) }} />
      ))}
      {room.sessions.map(renderSessionCard)}
    </div>
  );

  const renderBuildingSection = (building) => (
    <section key={building.buildingCode} className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{getCardTitle(building)}</h3>
          <p className="text-sm text-gray-500">
            {selectedDate ? dayLabelForDate(selectedDate) : ""}
            {!hasFocusedFilter ? ` · ${building.rooms.length} phòng` : ""}
          </p>
        </div>
      </div>
      <div className="overflow-auto">
        <div className="min-w-[600px]">
          <div className="grid border-b border-gray-200 sticky top-0 bg-white z-20"
            style={{ gridTemplateColumns: `72px repeat(${building.rooms.length}, minmax(160px, 1fr))` }}>
            <div className="sticky left-0 z-30 bg-white border-r border-gray-200" />
            {building.rooms.map((room) => (
              <div key={room.roomCode} className="h-10 flex items-center justify-center text-sm font-semibold text-gray-800 border-r border-gray-200">
                {room.roomCode}
              </div>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: `72px repeat(${building.rooms.length}, minmax(160px, 1fr))` }}>
            {/* Time axis */}
            <div className="relative bg-[#1E3A8A] text-white border-r border-sky-600 sticky left-0 z-10" style={{ height: gridHeight }}>
              <div className="grid" style={{ gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)` }}>
                {Array.from({ length: rowCount }).map((_, i) => <div key={i} className="border-b border-white/25" />)}
              </div>
              {timeAxis.map((time, i) => (
                <div key={time} className="absolute left-0 right-0 text-center text-[10px] font-semibold"
                  style={{ top: i * ROW_HEIGHT + ROW_HEIGHT / 2, transform: "translateY(-50%)" }}>
                  {time}
                </div>
              ))}
            </div>
            {building.rooms.map(renderRoomColumn)}
          </div>
        </div>
      </div>
    </section>
  );

  // ---------- UI ----------
  return (
    <div className="space-y-4">
      {/* ── Filters ── */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <select value={selectedSemesterId}
            onChange={(e) => { setSelectedSemesterId(e.target.value); setSelectedWeekNo(""); }}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="">Chọn học kỳ</option>
            {semesters.map((s) => (
              <option key={s.semesterId} value={s.semesterId}>{s.semesterName || s.semesterCode || `Học kỳ ${s.semesterId}`}</option>
            ))}
          </select>

          <select value={selectedBuildingId}
            onChange={(e) => { setSelectedBuildingId(e.target.value); setSelectedRoomId(""); }}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="">Tất cả tòa</option>
            {buildings.map((b) => <option key={b.buildingId} value={b.buildingId}>{b.buildingName || b.buildingCode}</option>)}
          </select>

          <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="">Tất cả phòng</option>
            {filteredRooms.map((r) => <option key={r.roomId} value={r.roomId}>{r.roomCode}</option>)}
          </select>

          <select value={selectedSessionType} onChange={(e) => setSelectedSessionType(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="">Tất cả loại</option>
            <option value="THEORY">Lý thuyết</option>
            <option value="PRACTICE">Thực hành</option>
          </select>

          <select value={selectedLecturerId}
            onChange={(e) => { setSelectedLecturerId(e.target.value); setSelectedSectionId(""); }}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="">Tất cả giảng viên</option>
            {lecturers.map((l) => <option key={l.lecturerId} value={l.lecturerId}>{l.lecturerName || l.lecturerCode}</option>)}
          </select>

          <select value={selectedSectionId}
            onChange={(e) => { setSelectedSectionId(e.target.value); setSelectedLecturerId(""); }}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="">Tất cả lớp học phần</option>
            {sections.map((sec) => <option key={sec.sectionId} value={sec.sectionId}>{sec.sectionCode} – {sec.courseName || sec.courseCode}</option>)}
          </select>

          {(selectedBuildingId || selectedRoomId || selectedSessionType || selectedLecturerId || selectedSectionId) && (
            <button type="button"
              onClick={() => { setSelectedBuildingId(""); setSelectedRoomId(""); setSelectedSessionType(""); setSelectedLecturerId(""); setSelectedSectionId(""); }}
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">
              Xóa bộ lọc
            </button>
          )}
        </div>

        {hasFocusedFilter && (
          <div className="mt-3 flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2">
            <span>🔍</span>
            <span>
              Chế độ xem tập trung —{" "}
              {selectedLecturer ? `GV: ${selectedLecturer.lecturerName}` : ""}
              {selectedLecturer && selectedSection ? " · " : ""}
              {selectedSection ? `Lớp: ${selectedSection.sectionCode}` : ""}
              . Chỉ hiển thị phòng có lịch.
            </span>
          </div>
        )}
      </section>

      {/* ── Week Navigation ── */}
      {selectedSemesterId && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 space-y-3">
          {/* Arrow nav */}
          <div className="flex items-center gap-3">
            <button type="button" disabled={!canPrev} onClick={() => goWeek(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-lg font-bold">
              ←
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm font-semibold text-gray-800">
                {selectedWeek
                  ? `Tuần ${selectedWeek.weekNo}: ${formatFull(selectedWeek.startDate)} – ${formatFull(selectedWeek.endDate)}`
                  : "Chọn tuần"}
              </span>
            </div>
            <button type="button" disabled={!canNext} onClick={() => goWeek(1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-lg font-bold">
              →
            </button>
          </div>

          {/* Day tabs */}
          {weekDates.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {weekDates.map((date, idx) => {
                const hasSessions = rawSessions.some((s) => s.sessionDate === date);
                const isActive = date === selectedDate;
                return (
                  <button key={date} type="button" onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                      ${isActive ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}
                      ${hasSessions ? "" : "opacity-50"}`}>
                    <span>{DAY_LABELS[idx]}</span>
                    <span className={isActive ? "text-blue-200" : "text-gray-400"}>{formatShort(date)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="text-sm text-gray-500 py-4">Đang tải thời khóa biểu...</div>
      ) : !selectedDate ? (
        <div className="text-sm text-gray-500">Vui lòng chọn học kỳ để bắt đầu.</div>
      ) : buildingGroups.length ? (
        <div className="space-y-6">
          {buildingGroups.map(renderBuildingSection)}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 text-center text-sm text-gray-500">
          {hasFocusedFilter
            ? "Không có lịch phù hợp với bộ lọc này trong ngày đã chọn."
            : `Không có lịch học trong ngày ${dayLabelForDate(selectedDate)}.`}
        </div>
      )}
    </div>
  );
}
