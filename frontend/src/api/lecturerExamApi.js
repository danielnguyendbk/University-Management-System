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

export const lecturerExamApi = {
  /**
   * Get semesters for Lecturer
   */
  async getSemesters() {
    const res = await apiClient.get("/lecturer/semesters");
    return res.data.data.map(sem => ({
      ...sem,
      id: sem.semesterId,
      name: sem.semesterName,
      code: sem.semesterCode,
      active: sem.status === "ACTIVE"
    }));
  },

  /**
   * Get exams where the logged-in lecturer is assigned to invigilate
   * @param {Object} params
   * @param {string|number} params.semesterId
   */
  async getMyInvigilations({ semesterId }) {
    if (!semesterId) return [];
    const res = await apiClient.get("/lecturer/exams", {
      params: { semesterId }
    });
    const invigilations = res.data.data;

    // Map database shape to expectations of lecturer screen
    return invigilations.map(exam => {
      return {
        ...exam,
        id: exam.examId, // Ensure compatibility with "id" in frontend components
        status: normalizeStatus(exam.status),
        examMethod: normalizeMethod(exam.examMethod),
        duration: exam.duration || getDurationLabel(exam.startTime, exam.endTime),
        daysRemaining: getDaysRemaining(exam.examDate),
        invigilatorRole: normalizeRole(exam.invigilatorRole || exam.role),
        note: exam.invigilatorNote || exam.note || ""
      };
    });
  }
};

export default lecturerExamApi;
