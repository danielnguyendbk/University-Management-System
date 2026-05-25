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

const normalizeStatus = (status) => {
  const value = String(status || "").trim().toUpperCase();
  if (value === "CANCEL" || value === "CANCELED") return "CANCELLED";
  return value;
};

const normalizeMethod = (method) => method ? String(method).trim().toUpperCase() : method;
const normalizeRole = (role) => String(role || "ASSISTANT").trim().toUpperCase() === "MAIN" ? "MAIN" : "ASSISTANT";

const mapExam = (exam) => ({
  ...exam,
  id: exam.examId,
  status: normalizeStatus(exam.status),
  examMethod: normalizeMethod(exam.examMethod),
  duration: exam.duration || getDurationLabel(exam.startTime, exam.endTime),
  daysRemaining: getDaysRemaining(exam.examDate),
  invigilators: (exam.invigilators || []).map(inv => ({
    ...inv,
    role: normalizeRole(inv.role)
  }))
});

export const adminExamApi = {
  /**
   * Fetch all semesters
   */
  async getSemesters() {
    const res = await apiClient.get("/admin/registration/semesters");
    return res.data.data.map(sem => ({
      ...sem,
      id: sem.semesterId,
      name: sem.semesterName,
      code: sem.semesterCode,
      active: sem.status === "ACTIVE"
    }));
  },

  /**
   * Fetch all rooms
   */
  async getRooms() {
    const res = await apiClient.get("/admin/exams/rooms");
    return res.data.data;
  },

  /**
   * Fetch all lecturers
   */
  async getLecturers() {
    const res = await apiClient.get("/admin/exams/lecturers");
    return res.data.data.map(lecturer => ({
      ...lecturer,
      fullName: lecturer.fullName || lecturer.lecturerName
    }));
  },

  /**
   * Fetch exams based on filters
   * @param {Object} filters 
   */
  async getExams(filters = {}) {
    const res = await apiClient.get("/admin/exams", {
      params: { semesterId: filters.semesterId }
    });
    return res.data.data.map(mapExam);
  },

  /**
   * Fetch list of eligible course sections with registered candidates
   * @param {string|number} semesterId
   */
  async getEligibleSections(semesterId) {
    const res = await apiClient.get("/admin/exams/eligible-sections", {
      params: { semesterId }
    });
    return res.data.data;
  },

  /**
   * Create a new exam schedule manually
   * @param {Object} examData 
   */
  async createExam(examData) {
    const payload = {
      semesterId: examData.semesterId,
      sectionId: examData.sectionId,
      roomId: examData.roomId,
      examType: examData.examType,
      examMethod: examData.examMethod,
      examDate: examData.examDate,
      startTime: examData.startTime,
      endTime: examData.endTime,
      seatRange: examData.seatRange,
      studentCount: Number(examData.studentCount),
      status: examData.status || "DRAFT",
      note: examData.note,
      invigilators: examData.invigilators || []
    };

    const res = await apiClient.post("/admin/exams", payload);
    const exam = res.data.data;
    return mapExam(exam);
  },

  /**
   * Update an existing exam schedule
   * @param {string|number} examId 
   * @param {Object} examData 
   */
  async updateExam(examId, examData) {
    const payload = {
      semesterId: examData.semesterId,
      sectionId: examData.sectionId,
      roomId: examData.roomId,
      examType: examData.examType,
      examMethod: examData.examMethod,
      examDate: examData.examDate,
      startTime: examData.startTime,
      endTime: examData.endTime,
      seatRange: examData.seatRange,
      studentCount: Number(examData.studentCount),
      status: examData.status,
      note: examData.note,
      invigilators: examData.invigilators || []
    };

    const res = await apiClient.put(`/admin/exams/${examId}`, payload);
    const exam = res.data.data;
    return mapExam(exam);
  },

  /**
   * Cancel an exam (sets status to CANCELLED)
   * @param {string|number} examId 
   */
  async cancelExam(examId) {
    const res = await apiClient.patch(`/admin/exams/${examId}/cancel`);
    const exam = res.data.data;
    return mapExam(exam);
  },

  /**
   * Hard delete an exam schedule
   * @param {string|number} examId 
   */
  async deleteExam(examId) {
    await apiClient.delete(`/admin/exams/${examId}`);
    return true;
  },

  /**
   * Publish all exams in a semester (sets all DRAFT exams to SCHEDULED)
   */
  async publishExams(semesterId) {
    const res = await apiClient.get("/admin/exams", {
      params: { semesterId }
    });
    const drafts = res.data.data.filter(e => normalizeStatus(e.status) === "DRAFT");
    await Promise.all(drafts.map(e => {
      return apiClient.put(`/admin/exams/${e.examId}`, {
        semesterId: e.semesterId,
        sectionId: e.sectionId,
        roomId: e.roomId,
        examType: e.examType,
        examMethod: e.examMethod,
        examDate: e.examDate,
        startTime: e.startTime,
        endTime: e.endTime,
        seatRange: e.seatRange,
        studentCount: e.studentCount,
        status: "SCHEDULED",
        note: e.note,
        invigilators: (e.invigilators || []).map(inv => ({
          lecturerId: inv.lecturerId,
          role: normalizeRole(inv.role),
          note: inv.note || ""
        }))
      });
    }));
    return true;
  },

  /**
   * Assign a lecturer to an exam
   * @param {string|number} examId 
   * @param {Object} invData 
   */
  async assignInvigilator(examId, invData) {
    const res = await apiClient.post(`/admin/exams/${examId}/invigilators`, {
      lecturerId: Number(invData.lecturerId),
      role: invData.role || "MAIN",
      note: invData.note || ""
    });
    const exam = res.data.data;
    return mapExam(exam);
  },

  /**
   * Remove a lecturer from an exam's invigilation duties
   * @param {string|number} examId 
   * @param {string|number} lecturerId 
   */
  async removeInvigilator(examId, lecturerId) {
    const res = await apiClient.delete(`/admin/exams/${examId}/invigilators/${lecturerId}`);
    const exam = res.data.data;
    return mapExam(exam);
  },

  /**
   * Simulate verification / checking of constraints for all exams in a semester
   * @param {string|number} semesterId 
   */
  async checkAllConstraints(semesterId) {
    const res = await apiClient.get("/admin/exams", {
      params: { semesterId }
    });
    const exams = res.data.data;
    let errorCount = 0;
    let warningCount = 0;
    const items = [];

    exams.forEach(exam => {
      const vList = exam.constraints || [];
      vList.forEach(v => {
        if (v.severity === "ERROR") errorCount++;
        if (v.severity === "WARNING") warningCount++;
        items.push({
          examId: exam.examId,
          courseCode: exam.courseCode,
          sectionCode: exam.sectionCode,
          roomCode: exam.roomCode,
          examDate: exam.examDate,
          startTime: exam.startTime,
          type: v.type,
          severity: v.severity,
          message: v.message
        });
      });
    });

    return {
      status: errorCount > 0 ? "ERROR" : warningCount > 0 ? "WARNING" : "PASS",
      errorCount,
      warningCount,
      details: items
    };
  },

  /**
   * Download the Excel import template
   */
  async downloadTemplate(semesterId) {
    const res = await apiClient.get("/admin/exams/import-template", {
      responseType: "blob",
      params: semesterId ? { semesterId } : undefined
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "UMS_Import_Exam_Template.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  /**
   * Simulate uploading an Excel file and running constraint checks.
   */
  async previewExcelImport(file, semesterId) {
    const formData = new FormData();
    formData.append("file", file);
    if (semesterId) formData.append("semesterId", semesterId);

    const res = await apiClient.post("/admin/exams/import/preview", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.data;
  },

  /**
   * Confirm import
   */
  async confirmExcelImport(file, semesterId) {
    const formData = new FormData();
    formData.append("file", file);
    if (semesterId) formData.append("semesterId", semesterId);

    const res = await apiClient.post("/admin/exams/import", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.data;
  }
};

export default adminExamApi;
