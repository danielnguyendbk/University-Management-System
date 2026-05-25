import apiClient from "./client";

const parseDateOnly = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = String(dateStr).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getDaysRemaining = (dateStr) => {
  const examDate = parseDateOnly(dateStr);
  if (!examDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  const diffTime = examDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
};

const getDurationLabel = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const [startHour, startMinute] = String(startTime).split(":").map(Number);
  const [endHour, endMinute] = String(endTime).split(":").map(Number);
  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) return "";
  const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  return minutes > 0 ? `${minutes} phút` : "";
};

const normalizeRole = (role) => String(role || "ASSISTANT").trim().toUpperCase() === "MAIN" ? "MAIN" : "ASSISTANT";
const normalizeStatus = (status) => {
  const value = String(status || "").trim().toUpperCase();
  if (value === "CANCEL" || value === "CANCELED") return "CANCELLED";
  return value;
};
const normalizeMethod = (method) => method ? String(method).trim().toUpperCase() : method;

export const studentExamApi = {
  /**
   * Get semesters for Student
   */
  async getSemesters() {
    const res = await apiClient.get("/student/registration/semesters");
    return res.data.data;
  },

  /**
   * Get exams for the logged in student in a specific semester
   * @param {Object} params
   * @param {string|number} params.semesterId
   */
  async getMyExams({ semesterId }) {
    if (!semesterId) return [];
    const res = await apiClient.get("/student/exams", {
      params: { semesterId }
    });
    const studentExams = res.data.data;

    return studentExams.map(exam => {
      // Get reminder state
      const reminderKey = `reminder_${exam.examId}`;
      const hasReminder = localStorage.getItem(reminderKey) === "true";

      // Match lecturer name if assigned
      const invigilators = (exam.invigilators || []).map(inv => ({
        ...inv,
        role: normalizeRole(inv.role)
      }));
      const mainInvigilator = invigilators.find(i => i.role === "MAIN") || invigilators[0];
      const lecturerName = mainInvigilator ? mainInvigilator.lecturerName : "Đang phân công";

      return {
        ...exam,
        id: exam.examId, // Ensure compatibility with "id" in frontend components
        status: normalizeStatus(exam.status),
        examMethod: normalizeMethod(exam.examMethod),
        duration: exam.duration || getDurationLabel(exam.startTime, exam.endTime),
        invigilators,
        lecturerName,
        daysRemaining: getDaysRemaining(exam.examDate),
        hasReminder
      };
    });
  },

  /**
   * Toggle a calendar reminder notification for an exam
   * @param {string|number} examId 
   */
  async toggleReminder(examId) {
    const key = `reminder_${examId}`;
    const currentValue = localStorage.getItem(key) === "true";
    localStorage.setItem(key, String(!currentValue));
    return !currentValue;
  }
};

export default studentExamApi;
