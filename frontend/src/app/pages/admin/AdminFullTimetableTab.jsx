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

/**
 * Group flat session rows into { buildingCode, buildingName, rooms: [{ roomCode, sessions }] }
 * Only includes buildings/rooms that have sessions.
 */
function groupSessionsByBuildingRoom(sessions = []) {
  const buildingMap = new Map();
  for (const session of sessions) {
    const bKey = session.buildingCode ?? "UNKNOWN";
    if (!buildingMap.has(bKey)) {
      buildingMap.set(bKey, {
        buildingCode: session.buildingCode,
        buildingName: session.buildingName,
        roomMap: new Map(),
      });
    }
    const building = buildingMap.get(bKey);
    const rKey = session.roomCode ?? "UNKNOWN";
    if (!building.roomMap.has(rKey)) {
      building.roomMap.set(rKey, { roomCode: session.roomCode, sessions: [] });
    }
    building.roomMap.get(rKey).sessions.push(session);
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

  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedWeekNo, setSelectedWeekNo] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const [loading, setLoading] = useState(false);

  // Load semesters
  useEffect(() => {
    async function fetchSemesters() {
      try {
        setLoading(true);
        const data = await getSemesters();
        setSemesters(data || []);
        if (data?.length) {
          const latest = getLatestSemester(data);
          const latestId = latest?.id ?? latest?.semesterId;
          setSelectedSemesterId(latestId ? String(latestId) : "");
        }
      } catch {
        toast.error("Không thể tải học kỳ.");
      } finally {
        setLoading(false);
      }
    }
    fetchSemesters();
  }, []);

  // Load weeks/buildings/rooms/sections when semester changes
  useEffect(() => {
    if (!selectedSemesterId) return;
    async function fetchSemesterData() {
      try {
        setLoading(true);
        const [weeksData, buildingsData, roomsData, sectionsData] = await Promise.all([
          getSemesterWeeks(selectedSemesterId),
          getBuildings(),
          getRooms(),
          getCourseSections(selectedSemesterId),
        ]);
        setSemesterWeeks(weeksData || []);
        setBuildings(buildingsData || []);
        setRooms(roomsData || []);
        setSections(sectionsData || []);
        // Reset dependent filters
        setSelectedBuildingId("");
        setSelectedRoomId("");
        setSelectedSectionId("");
        setSelectedLecturerId("");
        if (weeksData?.length) {
          const first = weeksData[0]?.weekNo ?? weeksData[0]?.id;
          setSelectedWeekNo(first ? String(first) : "");
        }
      } catch {
        toast.error("Không thể tải dữ liệu học kỳ.");
      } finally {
        setLoading(false);
      }
    }
    fetchSemesterData();
  }, [selectedSemesterId]);

  // Unique lecturers from sections
  const lecturers = useMemo(() => {
    const seen = new Set();
    return sections.filter((s) => s.lecturerId && !seen.has(s.lecturerId) && seen.add(s.lecturerId))
      .map((s) => ({ lecturerId: s.lecturerId, lecturerCode: s.lecturerCode, lecturerName: s.lecturerName }));
  }, [sections]);

  // Selected lecturer/section label helpers
  const selectedLecturer = useMemo(
    () => lecturers.find((l) => String(l.lecturerId) === String(selectedLecturerId)),
    [lecturers, selectedLecturerId]
  );
  const selectedSection = useMemo(
    () => sections.find((s) => String(s.sectionId) === String(selectedSectionId)),
    [sections, selectedSectionId]
  );

  // Fetch timetable
  useEffect(() => {
    if (!selectedSemesterId || !selectedWeekNo) return;
    async function fetchTimetable() {
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
      } catch (error) {
        const msg = error?.response?.data?.message || "Không thể tải thời khóa biểu.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchTimetable();
  }, [selectedSemesterId, selectedWeekNo, selectedBuildingId, selectedRoomId, selectedSessionType, selectedLecturerId, selectedSectionId]);

  // hasFocusedFilter: chỉ hiển thị tòa/phòng có session
  const hasFocusedFilter = Boolean(selectedLecturerId || selectedSectionId);

  // Group sessions by building/room
  const buildingGroups = useMemo(() => groupSessionsByBuildingRoom(rawSessions), [rawSessions]);

  // Card title logic
  const getCardTitle = (building) => {
    if (selectedLecturerId && selectedSectionId) {
      return "Lịch theo bộ lọc đã chọn";
    }
    if (selectedLecturerId && selectedLecturer) {
      return `Lịch của ${selectedLecturer.lecturerCode} - ${selectedLecturer.lecturerName}`;
    }
    if (selectedSectionId && selectedSection) {
      return `Lịch lớp ${selectedSection.sectionCode}`;
    }
    return `${building.buildingName || building.buildingCode} — ${building.rooms.length} phòng`;
  };

  const renderSessionCard = (session) => {
    if (!isTimeInsideGrid(session.startTime) || !isTimeInsideGrid(session.endTime)) return null;
    const status = normalizeSessionStatus(session);
    const style = statusStyles[status] || statusStyles.scheduled;
    const top = getTopByTime(session.startTime);
    const rawH = getHeightByTime(session.startTime, session.endTime);
    const height = Math.min(rawH + ROW_HEIGHT, gridHeight - top);
    const practiceGroupNo = Number(session.practiceGroupNo ?? 0);

    return (
      <div
        key={session.sessionId ?? `${session.courseCode}-${session.startTime}`}
        className={`absolute left-1 right-1 rounded-md border shadow-sm px-2 py-1.5 ${style.bg} ${style.text} ${style.border}`}
        style={{ top, height }}
      >
        <div className="text-xs font-semibold uppercase tracking-wide">{session.courseCode}</div>
        <div className="text-sm font-semibold leading-tight">{session.courseName}</div>
        <div className="text-xs text-gray-600">{session.sectionCode}</div>
        <div className="text-xs text-gray-600">{session.lecturerName}</div>
        {/* Trong focused view, hiển thị thêm phòng/tòa */}
        {hasFocusedFilter && (
          <div className="text-xs text-gray-500">
            {session.roomCode} {session.buildingName ? `· ${session.buildingName}` : ""}
          </div>
        )}
        <div className="mt-1 text-xs font-medium">
          {session.startTime?.slice(0, 5)} – {session.endTime?.slice(0, 5)}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{style.label}</span>
          {session.sessionType && (
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              {session.sessionType === "PRACTICE" ? "Thực hành" : "Lý thuyết"}
            </span>
          )}
          {practiceGroupNo > 0 && (
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              Nhóm {practiceGroupNo}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderRoomColumn = (room) => (
    <div key={room.roomCode} className="relative border-r border-gray-200" style={{ height: gridHeight }}>
      <div className="grid" style={{ gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)` }}>
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="border-b border-gray-100" />
        ))}
      </div>
      {breakRanges.map((range) => (
        <div
          key={range.start}
          className="absolute inset-x-0 bg-slate-50/80"
          style={{ top: getTopByTime(range.start), height: getHeightByTime(range.start, range.end) }}
        />
      ))}
      {room.sessions.map(renderSessionCard)}
    </div>
  );

  const renderBuildingSection = (building) => (
    <section key={building.buildingCode} className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{getCardTitle(building)}</h3>
        <p className="text-sm text-gray-500">
          {hasFocusedFilter
            ? `${building.rooms.length} phòng có lịch · ${building.buildingName || building.buildingCode}`
            : "Lịch học trong tuần đã chọn"}
        </p>
      </div>
      <div className="overflow-auto">
        <div className="min-w-[600px]">
          {/* Room headers */}
          <div
            className="grid border-b border-gray-200 sticky top-0 bg-white z-20"
            style={{ gridTemplateColumns: `72px repeat(${building.rooms.length}, minmax(180px, 1fr))` }}
          >
            <div className="sticky left-0 z-30 bg-white border-r border-gray-200" />
            {building.rooms.map((room) => (
              <div
                key={room.roomCode}
                className="h-12 flex items-center justify-center text-sm font-semibold text-gray-800 border-r border-gray-200"
              >
                {room.roomCode}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `72px repeat(${building.rooms.length}, minmax(180px, 1fr))` }}
          >
            {/* Time axis */}
            <div
              className="relative bg-[#1E3A8A] text-white border-r border-sky-600 sticky left-0 z-10"
              style={{ height: gridHeight }}
            >
              <div className="grid" style={{ gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)` }}>
                {Array.from({ length: rowCount }).map((_, i) => (
                  <div key={i} className="border-b border-white/25" />
                ))}
              </div>
              {timeAxis.map((time, i) => (
                <div
                  key={time}
                  className="absolute left-0 right-0 text-center text-xs font-semibold"
                  style={{ top: i * ROW_HEIGHT + ROW_HEIGHT / 2, transform: "translateY(-50%)" }}
                >
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

  // Filtered rooms for room dropdown (based on selected building)
  const filteredRooms = useMemo(
    () => rooms.filter((r) => !selectedBuildingId || String(r.buildingId) === String(selectedBuildingId)),
    [rooms, selectedBuildingId]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Học kỳ */}
          <select
            value={selectedSemesterId}
            onChange={(e) => { setSelectedSemesterId(e.target.value); setSelectedWeekNo(""); }}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Chọn học kỳ</option>
            {semesters.map((s) => (
              <option key={s.semesterId} value={s.semesterId}>
                {s.semesterName || s.semesterCode || `Học kỳ ${s.semesterId}`}
              </option>
            ))}
          </select>

          {/* Tuần */}
          <select
            value={selectedWeekNo}
            onChange={(e) => setSelectedWeekNo(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Chọn tuần</option>
            {semesterWeeks.map((w) => (
              <option key={w.semesterWeekId} value={w.weekNo}>
                Tuần {w.weekNo} ({w.startDate} – {w.endDate})
              </option>
            ))}
          </select>

          {/* Tòa nhà */}
          <select
            value={selectedBuildingId}
            onChange={(e) => { setSelectedBuildingId(e.target.value); setSelectedRoomId(""); }}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Tất cả tòa</option>
            {buildings.map((b) => (
              <option key={b.buildingId} value={b.buildingId}>
                {b.buildingName || b.buildingCode}
              </option>
            ))}
          </select>

          {/* Phòng */}
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Tất cả phòng</option>
            {filteredRooms.map((r) => (
              <option key={r.roomId} value={r.roomId}>{r.roomCode}</option>
            ))}
          </select>

          {/* Loại buổi */}
          <select
            value={selectedSessionType}
            onChange={(e) => setSelectedSessionType(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Tất cả loại</option>
            <option value="THEORY">Lý thuyết</option>
            <option value="PRACTICE">Thực hành</option>
          </select>

          {/* Giảng viên */}
          <select
            value={selectedLecturerId}
            onChange={(e) => { setSelectedLecturerId(e.target.value); setSelectedSectionId(""); }}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Tất cả giảng viên</option>
            {lecturers.map((l) => (
              <option key={l.lecturerId} value={l.lecturerId}>
                {l.lecturerName || l.lecturerCode}
              </option>
            ))}
          </select>

          {/* Lớp học phần */}
          <select
            value={selectedSectionId}
            onChange={(e) => { setSelectedSectionId(e.target.value); setSelectedLecturerId(""); }}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Tất cả lớp học phần</option>
            {sections.map((sec) => (
              <option key={sec.sectionId} value={sec.sectionId}>
                {sec.sectionCode} – {sec.courseName || sec.courseCode}
              </option>
            ))}
          </select>

          {/* Reset */}
          {(selectedBuildingId || selectedRoomId || selectedSessionType || selectedLecturerId || selectedSectionId) && (
            <button
              type="button"
              onClick={() => {
                setSelectedBuildingId("");
                setSelectedRoomId("");
                setSelectedSessionType("");
                setSelectedLecturerId("");
                setSelectedSectionId("");
              }}
              className="h-11 rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Focused filter badge */}
        {hasFocusedFilter && (
          <div className="mt-3 flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2">
            <span>🔍</span>
            <span>
              Chế độ xem tập trung —{" "}
              {selectedLecturerId && selectedLecturer ? `GV: ${selectedLecturer.lecturerName}` : ""}
              {selectedLecturerId && selectedSectionId ? " · " : ""}
              {selectedSectionId && selectedSection ? `Lớp: ${selectedSection.sectionCode}` : ""}
              . Chỉ hiển thị phòng có lịch.
            </span>
          </div>
        )}
      </section>

      {/* Timetable */}
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải thời khóa biểu...</div>
      ) : buildingGroups.length ? (
        <div className="space-y-6">
          {buildingGroups.map(renderBuildingSection)}
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          {selectedSemesterId && selectedWeekNo
            ? hasFocusedFilter
              ? "Không có lịch phù hợp với bộ lọc này."
              : "Không có dữ liệu thời khóa biểu cho tuần đã chọn."
            : "Vui lòng chọn học kỳ và tuần để xem thời khóa biểu."}
        </div>
      )}
    </div>
  );
}
