import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createSchedule,
  deleteSchedule,
  getCourseSections,
  getRooms,
  getSchedules,
  getSemesters,
  getTimeSlots,
  getSemesterWeeks,
  updateSchedule,
} from "../../../api/adminTimetableApi";
import { GRID_END, GRID_START, isTimeInsideGrid } from "../../../utils/timetableTimeUtils";
import { getLatestSemester } from "../../../utils/semesterUtils";

const weekdayOptions = [
  { value: "Mon", label: "Thứ 2" },
  { value: "Tue", label: "Thứ 3" },
  { value: "Wed", label: "Thứ 4" },
  { value: "Thu", label: "Thứ 5" },
  { value: "Fri", label: "Thứ 6" },
  { value: "Sat", label: "Thứ 7" },
  { value: "Sun", label: "Chủ nhật" },
];

const sessionTypeOptions = [
  { value: "THEORY", label: "Lý thuyết" },
  { value: "PRACTICE", label: "Thực hành" },
];

const defaultForm = {
  semesterId: "",
  sectionId: "",
  roomId: "",
  dayOfWeek: "Mon",
  fromWeekNo: "",
  toWeekNo: "",
  slotStart: "",
  slotEnd: "",
  startTime: "",
  endTime: "",
  sessionType: "THEORY",
  practiceGroupNo: "",
  note: "",
};

const slotGroups = [
  { min: 1, max: 4, start: "07:00", end: "10:30" },
  { min: 5, max: 8, start: "13:00", end: "16:30" },
  { min: 9, max: 12, start: "17:30", end: "21:00" },
];

const normalizeSlotNo = (slot) => {
  const slotNo = Number(slot?.slotNo ?? slot?.slotNumber ?? slot?.slotIndex ?? slot?.id);
  return Number.isNaN(slotNo) ? null : slotNo;
};

const getFallbackTimeBySlot = (slotNo, type) => {
  if (!slotNo) return "";
  const group = slotGroups.find((range) => slotNo >= range.min && slotNo <= range.max);
  if (!group) return "";
  return type === "start" ? group.start : group.end;
};

const parseApiErrorMessage = (error) => {
  const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra.";
  if (/phòng|room/i.test(message)) {
    return "Lịch mẫu bị trùng phòng. Vui lòng chọn phòng khác.";
  }
  if (/giảng viên|lecturer|teacher/i.test(message)) {
    return "Lịch mẫu bị trùng giảng viên. Vui lòng chọn lịch khác.";
  }
  if (/lớp|section|class/i.test(message)) {
    return "Lịch mẫu bị trùng lớp học phần. Vui lòng chọn lịch khác.";
  }
  return message;
};


export function AdminScheduleTemplatesTab({ refreshSignal = 0 }) {
  const [semesters, setSemesters] = useState([]);
  const [semesterWeeks, setSemesterWeeks] = useState([]);
  const [courseSections, setCourseSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  const selectedSemester = useMemo(() => semesters.find((item) => String(item.id ?? item.semesterId) === String(selectedSemesterId)), [semesters, selectedSemesterId]);

  const timetableStatus = String(
    selectedSemester?.timetableStatus ?? selectedSemester?.timetable_status ?? "DRAFT"
  ).toUpperCase();

  const isLocked = timetableStatus === "LOCKED";

  const slotOptions = useMemo(() => {
    const normalized = timeSlots
      .map((slot) => {
        const slotNo = normalizeSlotNo(slot);
        if (!slotNo || slotNo > 12) return null;
        return {
          slotNo,
          startTime: slot?.startTime ?? slot?.start_time,
          endTime: slot?.endTime ?? slot?.end_time,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.slotNo - b.slotNo);

    if (normalized.length) return normalized;

    return Array.from({ length: 12 }, (_, index) => ({
      slotNo: index + 1,
      startTime: "",
      endTime: "",
    }));
  }, [timeSlots]);

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
        toast.error("Không thể tải danh sách học kỳ.");
      } finally {
        setLoading(false);
      }
    }

    fetchSemesters();
  }, [refreshSignal]);

  useEffect(() => {
    if (!selectedSemesterId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const [weeksData, sectionsData, roomsData, slotsData, schedulesData] =
          await Promise.all([
            getSemesterWeeks(selectedSemesterId),
            getCourseSections(selectedSemesterId),
            getRooms(),
            getTimeSlots(),
            getSchedules(selectedSemesterId),
          ]);

        setSemesterWeeks(weeksData || []);
        setCourseSections(sectionsData || []);
        setRooms(roomsData || []);
        setTimeSlots(slotsData || []);
        setSchedules(schedulesData || []);
      } catch (error) {
        toast.error("Không thể tải dữ liệu lịch mẫu.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedSemesterId, refreshSignal]);

  useEffect(() => {
    if (!selectedSemesterId) return;
    setFormData((prev) => ({
      ...prev,
      semesterId: selectedSemesterId,
    }));
  }, [selectedSemesterId]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateTimeBySlots = (slotStart, slotEnd) => {
    const startSlot = slotOptions.find((slot) => slot.slotNo === Number(slotStart));
    const endSlot = slotOptions.find((slot) => slot.slotNo === Number(slotEnd));

    const nextStartTime =
      startSlot?.startTime || getFallbackTimeBySlot(Number(slotStart), "start");
    const nextEndTime = endSlot?.endTime || getFallbackTimeBySlot(Number(slotEnd), "end");

    setFormData((prev) => ({
      ...prev,
      slotStart,
      slotEnd,
      startTime: nextStartTime || prev.startTime,
      endTime: nextEndTime || prev.endTime,
    }));
  };

  const handleSlotStartChange = (value) => {
    const slotStart = value ? Number(value) : "";
    const slotEndValue = formData.slotEnd ? Number(formData.slotEnd) : "";
    const nextSlotEnd = slotEndValue && slotStart && slotEndValue < slotStart ? slotStart : slotEndValue;
    updateTimeBySlots(slotStart, nextSlotEnd || slotStart);
  };

  const handleSlotEndChange = (value) => {
    const slotEnd = value ? Number(value) : "";
    const slotStartValue = formData.slotStart ? Number(formData.slotStart) : "";
    const nextSlotStart = slotStartValue && slotEnd && slotStartValue > slotEnd ? slotEnd : slotStartValue;
    updateTimeBySlots(nextSlotStart || slotEnd, slotEnd);
  };

  const resetForm = () => {
    setFormData({
      ...defaultForm,
      semesterId: selectedSemesterId,
    });
    setEditingId(null);
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule?.id ?? schedule?.scheduleId ?? null);
    setFormData({
      semesterId: selectedSemesterId,
      sectionId: schedule?.sectionId ?? schedule?.courseSectionId ?? "",
      roomId: schedule?.roomId ?? "",
      dayOfWeek: schedule?.dayOfWeek ?? "Mon",
      fromWeekNo: schedule?.fromWeekNo ?? "",
      toWeekNo: schedule?.toWeekNo ?? "",
      slotStart: schedule?.slotStart ?? schedule?.slotStartNo ?? "",
      slotEnd: schedule?.slotEnd ?? schedule?.slotEndNo ?? "",
      startTime: schedule?.startTime ?? "",
      endTime: schedule?.endTime ?? "",
      sessionType: schedule?.sessionType ?? "THEORY",
      practiceGroupNo: schedule?.practiceGroupNo ?? "",
      note: schedule?.note ?? "",
    });
  };

  const handleDelete = async (schedule) => {
    const scheduleId = schedule?.id ?? schedule?.scheduleId;
    if (!scheduleId) return;
    if (!window.confirm("Xóa lịch mẫu này?")) return;

    try {
      await deleteSchedule(scheduleId);
      toast.success("Đã xóa lịch mẫu.");
      const data = await getSchedules(selectedSemesterId);
      setSchedules(data || []);
    } catch (error) {
      toast.error("Không thể xóa lịch mẫu.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSemesterId) {
      toast.error("Vui lòng chọn học kỳ.");
      return;
    }

    if (!formData.sectionId || !formData.roomId || !formData.fromWeekNo || !formData.toWeekNo) {
      toast.error("Vui lòng chọn đủ lớp học phần, phòng và tuần học.");
      return;
    }

    if (!formData.slotStart || !formData.slotEnd) {
      toast.error("Vui lòng chọn tiết bắt đầu và tiết kết thúc.");
      return;
    }

    const slotStartValue = Number(formData.slotStart);
    const slotEndValue = Number(formData.slotEnd);
    if (slotStartValue > slotEndValue) {
      toast.error("Tiết bắt đầu không thể sau tiết kết thúc.");
      return;
    }

    if (!isTimeInsideGrid(formData.startTime) || !isTimeInsideGrid(formData.endTime)) {
      toast.error(`Giờ học phải nằm trong khoảng ${GRID_START} - ${GRID_END}.`);
      return;
    }

    const payload = {
      semesterId: Number(selectedSemesterId),
      sectionId: Number(formData.sectionId),
      roomId: Number(formData.roomId),
      dayOfWeek: formData.dayOfWeek,
      fromWeekNo: Number(formData.fromWeekNo),
      toWeekNo: Number(formData.toWeekNo),
      slotStart: Number(formData.slotStart),
      slotEnd: Number(formData.slotEnd),
      startTime: formData.startTime,
      endTime: formData.endTime,
      sessionType: formData.sessionType,
      practiceGroupNo: formData.practiceGroupNo ? Number(formData.practiceGroupNo) : 0,
      note: formData.note?.trim() || "",
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateSchedule(editingId, payload);
        toast.success("Đã cập nhật lịch mẫu.");
      } else {
        await createSchedule(payload);
        toast.success("Đã tạo lịch mẫu.");
      }

      const data = await getSchedules(selectedSemesterId);
      setSchedules(data || []);
      resetForm();
    } catch (error) {
      toast.error(parseApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Danh sách lịch mẫu</h2>
            <p className="text-sm text-gray-500">Theo dõi các lịch mẫu đang áp dụng cho học kỳ.</p>
          </div>
          <div className="w-full lg:w-72">
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
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
        ) : schedules.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Lớp học phần</th>
                  <th className="py-2 pr-4">Phòng</th>
                  <th className="py-2 pr-4">Thứ</th>
                  <th className="py-2 pr-4">Tuần</th>
                  <th className="py-2 pr-4">Tiết</th>
                  <th className="py-2 pr-4">Giờ</th>
                  <th className="py-2 pr-4">Loại</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedules.map((schedule) => (
                  <tr key={schedule.id ?? schedule.scheduleId} className="text-gray-700">
                    <td className="py-3 pr-4">
                      {schedule.sectionCode || schedule.courseSectionCode || schedule.sectionId || "-"}
                    </td>
                    <td className="py-3 pr-4">{schedule.roomCode || schedule.roomName || "-"}</td>
                    <td className="py-3 pr-4">
                      {weekdayOptions.find((item) => item.value === schedule.dayOfWeek)?.label || "-"}
                    </td>
                    <td className="py-3 pr-4">
                      Tuần {schedule.fromWeekNo || "-"} - {schedule.toWeekNo || "-"}
                    </td>
                    <td className="py-3 pr-4">
                      {schedule.slotStart || "-"} - {schedule.slotEnd || "-"}
                    </td>
                    <td className="py-3 pr-4">
                      {schedule.startTime || "-"} - {schedule.endTime || "-"}
                    </td>
                    <td className="py-3 pr-4">
                      {schedule.sessionType === "PRACTICE" ? "Thực hành" : "Lý thuyết"}
                    </td>
                    <td className="py-3 pr-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(schedule)}
                        disabled={isLocked}
                        className="px-3 py-1 rounded-lg border border-gray-200 text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-60"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(schedule)}
                        disabled={isLocked}
                        className="px-3 py-1 rounded-lg border border-rose-200 text-rose-600 text-xs hover:bg-rose-50 disabled:opacity-60"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Chưa có lịch mẫu cho học kỳ này.</div>
        )}
      </section>

      {selectedSemesterId ? (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Cập nhật lịch mẫu" : "Tạo lịch mẫu"}
              </h2>
              <p className="text-sm text-gray-500">Nhập đủ thông tin để tạo hoặc chỉnh sửa lịch mẫu.</p>
            </div>
            {isLocked && (
              <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 px-3 py-1 text-xs font-medium">
                Học kỳ đã khóa lịch, tạm thời không cho chỉnh sửa.
              </span>
            )}
          </div>

          <form id="admin-schedule-template-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Học kỳ</label>
                <select
                  value={selectedSemesterId}
                  onChange={(event) => setSelectedSemesterId(event.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                  disabled
                >
                  <option value="">Chọn học kỳ</option>
                  {semesters.map((semester) => (
                    <option key={semester.id ?? semester.semesterId} value={semester.id ?? semester.semesterId}>
                      {semester.name || semester.semesterName || semester.code || `Học kỳ ${semester.id}`}
                    </option>
                  ))}
                </select>
              </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Lớp học phần</label>
              <select
                value={formData.sectionId}
                onChange={(event) => handleFormChange("sectionId", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                <option value="">Chọn lớp học phần</option>
                {courseSections.map((section) => (
                  <option key={section.id ?? section.sectionId} value={section.id ?? section.sectionId}>
                    {section.sectionCode || section.code || section.courseCode || "Lớp học phần"} -
                    {" "}
                    {section.courseName || section.name || ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phòng</label>
              <select
                value={formData.roomId}
                onChange={(event) => handleFormChange("roomId", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                <option value="">Chọn phòng</option>
                {rooms.map((room) => (
                  <option key={room.id ?? room.roomId} value={room.id ?? room.roomId}>
                    {room.roomCode || room.code || room.name || "Phòng"}
                    {room.buildingName ? ` - ${room.buildingName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Thứ học</label>
              <select
                value={formData.dayOfWeek}
                onChange={(event) => handleFormChange("dayOfWeek", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                {weekdayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Từ tuần</label>
              <select
                value={formData.fromWeekNo}
                onChange={(event) => handleFormChange("fromWeekNo", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                <option value="">Chọn tuần</option>
                {semesterWeeks.map((week) => (
                  <option key={week.weekNo ?? week.id} value={week.weekNo ?? week.weekNumber ?? week.id}>
                    Tuần {week.weekNo ?? week.weekNumber ?? week.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Đến tuần</label>
              <select
                value={formData.toWeekNo}
                onChange={(event) => handleFormChange("toWeekNo", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                <option value="">Chọn tuần</option>
                {semesterWeeks.map((week) => (
                  <option key={week.weekNo ?? week.id} value={week.weekNo ?? week.weekNumber ?? week.id}>
                    Tuần {week.weekNo ?? week.weekNumber ?? week.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tiết bắt đầu</label>
              <select
                value={formData.slotStart}
                onChange={(event) => handleSlotStartChange(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                <option value="">Chọn tiết</option>
                {slotOptions.map((slot) => (
                  <option key={slot.slotNo} value={slot.slotNo}>
                    Tiết {slot.slotNo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tiết kết thúc</label>
              <select
                value={formData.slotEnd}
                onChange={(event) => handleSlotEndChange(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                <option value="">Chọn tiết</option>
                {slotOptions.map((slot) => (
                  <option key={slot.slotNo} value={slot.slotNo}>
                    Tiết {slot.slotNo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Giờ bắt đầu</label>
              <input
                value={formData.startTime}
                onChange={(event) => handleFormChange("startTime", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                placeholder="07:00"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Giờ kết thúc</label>
              <input
                value={formData.endTime}
                onChange={(event) => handleFormChange("endTime", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                placeholder="10:30"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Loại buổi</label>
              <select
                value={formData.sessionType}
                onChange={(event) => handleFormChange("sessionType", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                disabled={isLocked}
              >
                {sessionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nhóm thực hành</label>
              <input
                type="number"
                value={formData.practiceGroupNo}
                onChange={(event) => handleFormChange("practiceGroupNo", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                placeholder="0"
                min={0}
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Ghi chú</label>
              <input
                value={formData.note}
                onChange={(event) => handleFormChange("note", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                placeholder="Nhập ghi chú nếu có"
                disabled={isLocked}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || isLocked}
              className="px-5 py-2 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1E3A8A]/90 disabled:opacity-60"
            >
              {editingId ? "Cập nhật" : "Lưu lịch mẫu"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium"
            >
              Làm mới
            </button>
          </div>
          </form>
        </section>
      ) : (
        <div className="text-sm text-gray-500">Vui lòng chọn học kỳ trước khi tạo lịch mẫu.</div>
      )}
    </div>
  );
}
