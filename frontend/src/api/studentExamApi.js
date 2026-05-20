import apiClient from "./client";

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

    // Calculate days remaining dynamically
    const today = new Date();
    today.setHours(0,0,0,0);

    return studentExams.map(exam => {
      const examDateObj = new Date(exam.examDate);
      examDateObj.setHours(0,0,0,0);
      const diffTime = examDateObj - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Get reminder state
      const reminderKey = `reminder_${exam.examId}`;
      const hasReminder = localStorage.getItem(reminderKey) === "true";

      // Match lecturer name if assigned
      const mainInvigilator = exam.invigilators?.find(i => i.role === "MAIN") || exam.invigilators?.[0];
      const lecturerName = mainInvigilator ? mainInvigilator.lecturerName : "Đang phân công";

      return {
        ...exam,
        id: exam.examId, // Ensure compatibility with "id" in frontend components
        lecturerName,
        daysRemaining: diffDays >= 0 ? diffDays : 0,
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
