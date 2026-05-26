package com.ptit.studentportal.registration.service;

import com.ptit.studentportal.registration.dto.response.LecturerSectionResponse;
import com.ptit.studentportal.registration.dto.response.SectionStudentResponse;

import java.util.List;

public interface LecturerRegistrationService {
    List<LecturerSectionResponse> getLecturerSections(Long lecturerId, Long semesterId);
    List<SectionStudentResponse> getLecturerSectionStudents(Long lecturerId, Long sectionId);
}
