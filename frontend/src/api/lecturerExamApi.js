import apiClient from "./client";

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
        invigilatorRole: exam.invigilatorRole || exam.role || "ASSISTANT",
        note: exam.invigilatorNote || exam.note || ""
      };
    });
  }
};

export default lecturerExamApi;
