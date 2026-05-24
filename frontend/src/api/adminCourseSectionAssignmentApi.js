import apiClient from "./client";

export const adminCourseSectionAssignmentApi = {
  getAssignments: (semesterId) =>
    apiClient.get("/admin/course-section-assignments", {
      params: { semesterId }
    }),

  getLecturers: () =>
    apiClient.get("/admin/course-section-assignments/lecturers"),

  assignLecturer: (sectionId, data) =>
    apiClient.patch(`/admin/course-section-assignments/${sectionId}/lecturer`, data),

  unassignLecturer: (sectionId) =>
    apiClient.patch(`/admin/course-section-assignments/${sectionId}/unassign`)
};

export default adminCourseSectionAssignmentApi;
