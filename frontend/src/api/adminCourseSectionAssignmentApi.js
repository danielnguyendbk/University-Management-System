import apiClient from "./client";

export const adminCourseSectionAssignmentApi = {
  getAssignments: (semesterId) =>
    apiClient.get("/admin/section-assignments", {
      params: { semesterId }
    }),

  getLecturers: () =>
    apiClient.get("/admin/section-assignments/lecturers"),

  assignLecturer: (sectionId, data) =>
    apiClient.patch(`/admin/section-assignments/${sectionId}/lecturer`, data),

  unassignLecturer: (sectionId) =>
    apiClient.patch(`/admin/section-assignments/${sectionId}/unassign`)
};

export default adminCourseSectionAssignmentApi;
