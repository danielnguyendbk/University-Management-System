import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getBuildings, getFullTimetable, getSemesterWeeks, getSemesters } from "../../../api/adminTimetableApi";
import {
  buildTimeAxis,
  getHeightByTime,
  getTopByTime,
  getWeekDatesFromMonday,
  isTimeInsideGrid,
  ROW_HEIGHT,
} from "../../../utils/timetableTimeUtils";
import { getLatestSemester } from "../../../utils/semesterUtils";

const weekdayFilterOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "1", label: "Thứ 2" },
  { value: "2", label: "Thứ 3" },
  { value: "3", label: "Thứ 4" },
  { value: "4", label: "Thứ 5" },
  { value: "5", label: "Thứ 6" },
  { value: "6", label: "Thứ 7" },
  { value: "7", label: "Chủ nhật" },
];

const breakRanges = [
  { start: "11:00", end: "13:00" },
  { start: "17:00", end: "17:30" },
];

const formatDateISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekdayIndex = (date) => {
  const day = date.getDay();
  return ((day + 6) % 7) + 1;
};

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

export function AdminFullTimetableTab() {
  const [semesters, setSemesters] = useState([]);
  const [semesterWeeks, setSemesterWeeks] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [buildingGroups, setBuildingGroups] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedWeekNo, setSelectedWeekNo] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("ALL");
  const [selectedWeekday, setSelectedWeekday] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSemesters() {
      try {
        setLoading(true);
        const data = await getSemesters();
        setSemesters(data || []);
        if (data?.length && !selectedSemesterId) {
          const latestSemester = getLatestSemester(data);
          const latestId = latestSemester?.id ?? latestSemester?.semesterId;
          setSelectedSemesterId(latestId ? String(latestId) : "");
        }
      } catch (error) {
        toast.error("Không thể tải học kỳ.");
      } finally {
        setLoading(false);
      }
    }

    fetchSemesters();
  }, []);

  useEffect(() => {
    if (!selectedSemesterId) return;

    async function fetchSemesterData() {
      try {
        setLoading(true);
        const [weeksData, buildingsData] = await Promise.all([
          getSemesterWeeks(selectedSemesterId),
          getBuildings(),
        ]);
        setSemesterWeeks(weeksData || []);
        setBuildings(buildingsData || []);
        if (weeksData?.length && !selectedWeekNo) {
          const firstWeek = weeksData[0]?.weekNo ?? weeksData[0]?.weekNumber ?? weeksData[0]?.id;
          setSelectedWeekNo(firstWeek ? String(firstWeek) : "");
        }
      } catch (error) {
        toast.error("Không thể tải tuần học kỳ.");
      } finally {
        setLoading(false);
      }
    }

    fetchSemesterData();
  }, [selectedSemesterId, selectedWeekNo]);

  const selectedWeek = useMemo(
    () => semesterWeeks.find((week) => String(week.weekNo ?? week.weekNumber ?? week.id) === String(selectedWeekNo)),
    [semesterWeeks, selectedWeekNo]
  );

  useEffect(() => {
    if (!semesterWeeks.length) return;
    if (!selectedWeek) {
      const firstWeek = semesterWeeks[0]?.weekNo ?? semesterWeeks[0]?.weekNumber ?? semesterWeeks[0]?.id;
      setSelectedWeekNo(firstWeek ? String(firstWeek) : "");
    }
  }, [semesterWeeks, selectedWeek]);

  const weekDates = useMemo(() => {
    if (!selectedWeek?.startDate) return [];
    return getWeekDatesFromMonday(selectedWeek.startDate);
  }, [selectedWeek]);

  useEffect(() => {
    if (!selectedSemesterId || !selectedWeek) return;

    const fromDate = weekDates[0] ? formatDateISO(weekDates[0]) : selectedWeek.startDate;
    const toDate = weekDates[6] ? formatDateISO(weekDates[6]) : selectedWeek.endDate;

    async function fetchTimetable() {
      try {
        setLoading(true);
        const data = await getFullTimetable({
          semesterId: selectedSemesterId,
          fromDate,
          toDate,
          buildingId: selectedBuildingId === "ALL" ? undefined : selectedBuildingId,
        });
        setBuildingGroups(data || []);
      } catch (error) {
        toast.error("Không thể tải thời khóa biểu.");
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, [selectedSemesterId, selectedWeek, selectedBuildingId, weekDates]);

  const filteredBuildingGroups = useMemo(() => {
    if (selectedWeekday === "ALL") return buildingGroups;
    const weekdayValue = Number(selectedWeekday);
    return buildingGroups.map((building) => ({
      ...building,
      rooms: (building.rooms || []).map((room) => ({
        ...room,
        sessions: (room.sessions || []).filter((item) => {
          const rawDate = item.sessionDate;
          if (!rawDate) return true;
          const dateValue = new Date(`${rawDate}T00:00:00`);
          if (Number.isNaN(dateValue.getTime())) return true;
          return getWeekdayIndex(dateValue) === weekdayValue;
        }),
      })),
    }));
  }, [buildingGroups, selectedWeekday]);

  const renderRoomColumn = (room, roomSessions) => (
    <div key={room.id} className="relative border-r border-gray-200" style={{ height: gridHeight }}>
      <div
        className="grid"
        style={{
          gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)`,
        }}
      >
        {Array.from({ length: rowCount }).map((_, index) => (
          <div key={`${room.id}-row-${index}`} className="border-b border-gray-100" />
        ))}
      </div>

      {breakRanges.map((range) => (
        <div
          key={`${room.id}-${range.start}`}
          className="absolute inset-x-0 bg-slate-50/80"
          style={{
            top: getTopByTime(range.start),
            height: getHeightByTime(range.start, range.end),
          }}
        />
      ))}

      {roomSessions.map((session) => {
        if (!isTimeInsideGrid(session.startTime) || !isTimeInsideGrid(session.endTime)) {
          return null;
        }

        const status = normalizeSessionStatus(session);
        const style = statusStyles[status] || statusStyles.scheduled;
        const top = getTopByTime(session.startTime);
        const rawHeight = getHeightByTime(session.startTime, session.endTime);
        const height = Math.min(rawHeight + ROW_HEIGHT, gridHeight - top);
        const sessionType = session.sessionType ?? session.type;
        const practiceGroupNo = Number(session.practiceGroupNo ?? session.practice_group_no ?? 0);

        return (
          <div
            key={session.sessionId ?? session.id ?? `${session.courseCode}-${session.startTime}`}
            className={`absolute left-2 right-2 rounded-md border shadow-sm px-3 py-2 ${style.bg} ${style.text} ${style.border}`}
            style={{ top, height }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide">{session.courseCode}</div>
            <div className="text-sm font-semibold">{session.courseName}</div>
            <div className="text-xs text-gray-600">{session.sectionCode}</div>
            <div className="text-xs text-gray-600">{session.lecturerName}</div>
            <div className="mt-1 text-xs font-medium">
              {session.startTime} - {session.endTime}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                {style.label}
              </span>
              {sessionType && (
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                  {sessionType === "PRACTICE" ? "Thực hành" : "Lý thuyết"}
                </span>
              )}
              {practiceGroupNo > 0 && (
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                  Nhóm {practiceGroupNo}
                </span>
              )}
            </div>
            {status === "cancelled" && session.cancellationReason && (
              <div className="mt-2 text-[11px] text-rose-700">{session.cancellationReason}</div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={selectedSemesterId}
            onChange={(event) => setSelectedSemesterId(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Chọn học kỳ</option>
            {semesters.map((semester) => (
              <option key={semester.id ?? semester.semesterId} value={semester.id ?? semester.semesterId}>
                {semester.name || semester.semesterName || semester.code || `Học kỳ ${semester.id}`}
              </option>
            ))}
          </select>

          <select
            value={selectedWeekNo}
            onChange={(event) => setSelectedWeekNo(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Chọn tuần</option>
            {semesterWeeks.map((week) => (
              <option key={week.weekNo ?? week.id} value={week.weekNo ?? week.weekNumber ?? week.id}>
                Tuần {week.weekNo ?? week.weekNumber ?? week.id}
              </option>
            ))}
          </select>

          <select
            value={selectedBuildingId}
            onChange={(event) => setSelectedBuildingId(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="ALL">Tất cả tòa</option>
            {buildings.map((building) => (
              <option key={building.id ?? building.buildingId ?? building.code} value={building.id ?? building.buildingId ?? building.code}>
                {building.name || building.buildingName || building.code || "Tòa"}
              </option>
            ))}
          </select>

          <select
            value={selectedWeekday}
            onChange={(event) => setSelectedWeekday(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            {weekdayFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="text-sm text-gray-500">Đang tải thời khóa biểu...</div>
      ) : filteredBuildingGroups.length ? (
        <div className="space-y-6">
          {filteredBuildingGroups.map((building) => (
            <section key={building.buildingId ?? building.buildingCode} className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {building.buildingName || building.buildingCode || "Tòa"} - {building.rooms.length} phòng
                  </h3>
                  <p className="text-sm text-gray-500">Lịch học trong tuần đã chọn</p>
                </div>
              </div>

              <div className="overflow-auto">
                <div className="min-w-[800px]">
                  <div
                    className="grid border-b border-gray-200 sticky top-0 bg-white z-20"
                    style={{ gridTemplateColumns: `72px repeat(${building.rooms.length}, minmax(180px, 1fr))` }}
                  >
                    <div className="sticky left-0 z-30 bg-white border-r border-gray-200" />
                    {building.rooms.map((room) => (
                      <div
                        key={room.roomId ?? room.roomCode}
                        className="h-12 flex items-center justify-center text-sm font-semibold text-gray-800 border-r border-gray-200"
                      >
                        {room.roomName || room.roomCode}
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid"
                    style={{ gridTemplateColumns: `72px repeat(${building.rooms.length}, minmax(180px, 1fr))` }}
                  >
                    <div
                      className="relative bg-[#1E3A8A] text-white border-r border-sky-600 sticky left-0 z-10"
                      style={{ height: gridHeight }}
                    >
                      <div
                        className="grid"
                        style={{
                          gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)`,
                        }}
                      >
                        {Array.from({ length: rowCount }).map((_, index) => (
                          <div key={`time-line-${index}`} className="border-b border-white/25" />
                        ))}
                      </div>

                      {timeAxis.map((time, index) => (
                        <div
                          key={time}
                          className="absolute left-0 right-0 text-center text-xs font-semibold"
                          style={{
                            top: index * ROW_HEIGHT + ROW_HEIGHT / 2,
                            transform: "translateY(-50%)",
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>

                    {building.rooms.map((room) => renderRoomColumn(
                      { id: room.roomId ?? room.roomCode, name: room.roomName || room.roomCode },
                      room.sessions || []
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">Chưa có dữ liệu thời khóa biểu cho bộ lọc này.</div>
      )}
    </div>
  );
}
