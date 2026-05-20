import { useState, useEffect, useMemo, useCallback } from "react";
import { getWeekDatesFromMonday } from "../utils/timetableTimeUtils";

const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useAcademicWeeks({ fetchSemesters, fetchWeeks, fetchCalendarBlocks }) {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [semesterWeeks, setSemesterWeeks] = useState([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(-1);
  const [calendarBlocks, setCalendarBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Fetch semesters
  useEffect(() => {
    async function loadSemesters() {
      try {
        const response = await fetchSemesters();
        // Normalize semester list
        const raw = response.data || response;
        const semesterList = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.result)
          ? raw.result
          : [];

        setSemesters(semesterList);

        if (semesterList.length > 0) {
          const active = semesterList.find(s => s.status === 'ACTIVE') || semesterList[0];
          setSelectedSemesterId(active.semesterId || active.id);
        }
      } catch (error) {
        console.error("Lỗi tải học kỳ:", error);
        setSemesters([]);
        setErrorMessage("Không thể tải danh sách học kỳ.");
      }
    }
    loadSemesters();
  }, [fetchSemesters]);

  // 2. Fetch weeks and calendar blocks when selectedSemesterId changes
  useEffect(() => {
    if (!selectedSemesterId) return;

    async function loadWeeksAndBlocks() {
      try {
        setLoading(true);
        setErrorMessage("");
        
        // Fetch weeks
        const weeksRaw = await fetchWeeks(selectedSemesterId);
        const weekList = Array.isArray(weeksRaw)
          ? weeksRaw
          : Array.isArray(weeksRaw?.data)
          ? weeksRaw.data
          : [];

        setSemesterWeeks(weekList);

        // Find current week based on today's date
        const today = new Date().toISOString().split('T')[0];
        const currentIndex = weekList.findIndex(w => today >= w.startDate && today <= w.endDate);

        if (currentIndex !== -1) {
          setSelectedWeekIndex(currentIndex);
        } else if (weekList.length > 0) {
          setSelectedWeekIndex(0);
        }

        // Fetch calendar blocks (holidays)
        if (fetchCalendarBlocks) {
          const blocksData = await fetchCalendarBlocks(selectedSemesterId);
          setCalendarBlocks(blocksData || []);
        }
      } catch (error) {
        console.error("Lỗi tải tuần học hoặc ngày nghỉ:", error);
        setSemesterWeeks([]);
        setCalendarBlocks([]);
        setErrorMessage("Không thể tải danh sách tuần hoặc ngày nghỉ.");
      } finally {
        setLoading(false);
      }
    }
    loadWeeksAndBlocks();
  }, [selectedSemesterId, fetchWeeks, fetchCalendarBlocks]);

  const selectedWeek = useMemo(() => {
    const weeksArray = Array.isArray(semesterWeeks) ? semesterWeeks : [];
    if (selectedWeekIndex >= 0 && selectedWeekIndex < weeksArray.length) {
      return weeksArray[selectedWeekIndex];
    }
    return null;
  }, [semesterWeeks, selectedWeekIndex]);

  const weekDates = useMemo(() => {
    if (!selectedWeek?.startDate) {
      return getWeekDatesFromMonday(new Date());
    }
    return getWeekDatesFromMonday(selectedWeek.startDate);
  }, [selectedWeek]);

  const weekDays = useMemo(() => {
    const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    return labels.map((label, index) => {
      const date = weekDates[index] || new Date();
      return {
        index,
        label,
        date,
        dateString: formatDateToISO(date),
      };
    });
  }, [weekDates]);

  const handlePreviousWeek = useCallback(() => {
    setSelectedWeekIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setSelectedWeekIndex((prev) => {
      const weeksArray = Array.isArray(semesterWeeks) ? semesterWeeks : [];
      return Math.min(weeksArray.length - 1, prev + 1);
    });
  }, [semesterWeeks]);

  return {
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    semesterWeeks,
    selectedWeekIndex,
    setSelectedWeekIndex,
    selectedWeek,
    calendarBlocks,
    loading,
    errorMessage,
    setErrorMessage,
    weekDates,
    weekDays,
    handlePreviousWeek,
    handleNextWeek
  };
}
