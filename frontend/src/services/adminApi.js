import { API_BASE_URL, getStoredToken } from "./app";

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    const message = payload?.message || (payload ? JSON.stringify(payload) : "Request failed");
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/octet-stream") || contentType.includes("application/vnd")) {
    return response.blob();
  }

  return response.json();
}

export async function listDepartments() {
  const payload = await request("/admin/departments");
  return payload?.data || payload || [];
}

export async function listPrograms(departmentId) {
  const query = departmentId ? `?departmentId=${departmentId}` : "";
  const payload = await request(`/admin/programs${query}`);
  return payload?.data || payload || [];
}

export async function listStudents(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const payload = await request(`/admin/students?${searchParams.toString()}`);
  return payload?.data;
}

export async function listStudentCohorts(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const payload = await request(`/admin/students/cohorts?${searchParams.toString()}`);
  return payload?.data || payload || [];
}

export async function getStudent(id) {
  const payload = await request(`/admin/students/${id}`);
  return payload?.data;
}

export async function updateStudent(id, body) {
  const payload = await request(`/admin/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function updateStudentStatus(id, academicStatus) {
  const payload = await request(`/admin/students/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ academicStatus }),
  });
  return payload?.data;
}

export async function batchUpdateStudentStatus(studentIds, academicStatus) {
  const payload = await request("/admin/students/batch-status", {
    method: "PATCH",
    body: JSON.stringify({ studentIds, academicStatus }),
  });
  return payload?.data;
}

export async function downloadStudentTemplate() {
  return request("/admin/students/import/template");
}

export async function importStudents(file) {
  const formData = new FormData();
  formData.append("file", file);
  const payload = await request("/admin/students/import", {
    method: "POST",
    body: formData,
  });
  return payload?.data;
}

export async function listLecturers(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const payload = await request(`/admin/lecturers?${searchParams.toString()}`);
  return payload?.data;
}

export async function listLecturerTitles() {
  const payload = await request("/admin/lecturers/titles");
  return payload?.data || payload || [];
}

export async function getLecturer(id) {
  const payload = await request(`/admin/lecturers/${id}`);
  return payload?.data;
}

export async function createLecturer(body) {
  const payload = await request("/admin/lecturers", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function updateLecturer(id, body) {
  const payload = await request(`/admin/lecturers/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function updateLecturerStatus(id, status) {
  const payload = await request(`/admin/lecturers/${id}/account-status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return payload?.data;
}

export async function resetLecturerPassword(id, newPassword) {
  const payload = await request(`/admin/lecturers/${id}/reset-password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
  return payload?.data;
}

export async function downloadLecturerTemplate() {
  return request("/admin/lecturers/import/template");
}

export async function importLecturers(file) {
  const formData = new FormData();
  formData.append("file", file);
  const payload = await request("/admin/lecturers/import", {
    method: "POST",
    body: formData,
  });
  return payload?.data;
}

export async function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ─── Course Management ───

export async function listCourses(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const payload = await request(`/admin/courses?${searchParams.toString()}`);
  return payload?.data;
}

export async function getCourse(courseId) {
  const payload = await request(`/admin/courses/${courseId}`);
  return payload?.data;
}

export async function createCourse(body) {
  const payload = await request("/admin/courses", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function updateCourse(courseId, body) {
  const payload = await request(`/admin/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function deleteCourse(courseId) {
  await request(`/admin/courses/${courseId}`, { method: "DELETE" });
}

export async function importCourses(file) {
  const formData = new FormData();
  formData.append("file", file);
  const payload = await request("/admin/courses/import", {
    method: "POST",
    body: formData,
  });
  return payload?.data;
}

// ─── Program Courses ───

export async function listProgramCourses(programId) {
  const payload = await request(`/admin/programs/${programId}/courses`);
  return payload?.data || [];
}

export async function listAvailableCourses(programId) {
  const payload = await request(`/admin/programs/${programId}/courses/available`);
  return payload?.data || [];
}

export async function assignCourseToProgram(programId, body) {
  const payload = await request(`/admin/programs/${programId}/courses`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function updateProgramCourse(programId, programCourseId, body) {
  const payload = await request(`/admin/programs/${programId}/courses/${programCourseId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return payload?.data;
}

export async function removeProgramCourse(programId, courseId) {
  await request(`/admin/programs/${programId}/courses/${courseId}`, {
    method: "DELETE",
  });
}

export async function importProgramCourses(programId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const payload = await request(`/admin/programs/${programId}/courses/import`, {
    method: "POST",
    body: formData,
  });
  return payload?.data;
}
