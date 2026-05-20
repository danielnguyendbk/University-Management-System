import apiClient from "./client";

export const registrationApi = {
  admin: {
    getSemesters: () => apiClient.get("/admin/registration/semesters"),
    openRegistration: (semesterId, data) =>
      apiClient.patch(`/admin/registration/semesters/${semesterId}/open`, data),
    closeRegistration: (semesterId) =>
      apiClient.patch(`/admin/registration/semesters/${semesterId}/close`),
    lockRegistration: (semesterId) =>
      apiClient.patch(`/admin/registration/semesters/${semesterId}/lock`),
    getSections: (semesterId) =>
      apiClient.get("/admin/registration/sections", { params: { semesterId } }),
    createSection: (data) =>
      apiClient.post("/admin/registration/sections", data),
    updateSection: (sectionId, data) =>
      apiClient.put(`/admin/registration/sections/${sectionId}`, data),
    getSectionStudents: (sectionId) =>
      apiClient.get(`/admin/registration/sections/${sectionId}/students`),
    sendNotification: (semesterId, data) =>
      apiClient.post(`/admin/registration/semesters/${semesterId}/notify`, data),
  },

  student: {
    getSemesters: () =>
      apiClient.get("/student/registration/semesters"),
    getAvailableSections: (semesterId) =>
      apiClient.get("/student/registration/available-sections", {
        params: { semesterId },
      }),
    getMySections: (semesterId) =>
      apiClient.get("/student/registration/my-sections", {
        params: { semesterId },
      }),
    register: (sectionId) =>
      apiClient.post("/student/registration/enrollments", { sectionId }),
    drop: (enrollmentId) =>
      apiClient.delete(`/student/registration/enrollments/${enrollmentId}`),
  },

  lecturer: {
    getSections: (semesterId) =>
      apiClient.get("/lecturer/sections", {
        params: { semesterId },
      }),
    getSectionStudents: (sectionId) =>
      apiClient.get(`/lecturer/sections/${sectionId}/students`),
  },
};
