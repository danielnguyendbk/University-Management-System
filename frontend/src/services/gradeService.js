import { API_BASE_URL, getStoredToken, parseApiError } from "./app";

async function request(path, options = {}) {
	const token = getStoredToken();
	const headers = {
		"Content-Type": "application/json",
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
		throw new Error(await parseApiError(response));
	}

	const payload = await response.json();
	return payload?.data;
}

export function getStudentGrades(studentId) {
	return request(`/students/${studentId}/grades`);
}

export function getStudentGradesBySemester(studentId, semesterId) {
	return request(`/students/${studentId}/grades/semester/${semesterId}`);
}

export function getStudentGpaSummary(studentId) {
	return request(`/students/${studentId}/gpa`);
}

export function getLecturerSections(lecturerId) {
	return request(`/lecturers/${lecturerId}/sections`);
}

export function getSectionGrades(lecturerId, sectionId) {
	return request(`/lecturers/${lecturerId}/sections/${sectionId}/grades`);
}

export function getGradeByEnrollmentId(lecturerId, enrollmentId) {
	return request(`/lecturers/${lecturerId}/grades/${enrollmentId}`);
}

export function updateGrade(lecturerId, enrollmentId, payload) {
	return request(`/lecturers/${lecturerId}/grades/${enrollmentId}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export function updateGradesBatch(lecturerId, updates) {
	// updates: [ { enrollmentId, gradeData: { attendanceScore, exerciseScore, ... } }, ... ]
	const payload = {
		grades: updates.map(update => ({
			enrollmentId: update.enrollmentId,
			gradeData: update.gradeData,
		})),
	};

	return request(`/lecturers/${lecturerId}/grades/batch-update`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}
