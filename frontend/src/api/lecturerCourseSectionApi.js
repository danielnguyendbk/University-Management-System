import apiClient from "./client";

export const lecturerCourseSectionApi = {
  getMyCourseSections: (semesterId) =>
    apiClient.get("/lecturer/course-sections", {
      params: { semesterId },
    }),
  getSemesters: () =>
    apiClient.get("/lecturer/semesters"),
  getSectionStudents: (sectionId) =>
    apiClient.get(`/lecturer/registration/sections/${sectionId}/students`),
};
