package com.ptit.studentportal.registration.service;

import com.ptit.studentportal.registration.dto.request.RegisterSectionRequest;
import com.ptit.studentportal.registration.dto.response.*;

import java.util.List;

public interface StudentRegistrationService {
    List<RegistrationSemesterResponse> getRegistrationSemesters();
    List<AvailableSectionResponse> getAvailableSections(String username, Long semesterId);
    List<MyEnrollmentResponse> getMySections(String username, Long semesterId);
    EnrollmentActionResponse registerSection(String username, Long sectionId);
    EnrollmentActionResponse dropEnrollment(String username, Long enrollmentId);
}
