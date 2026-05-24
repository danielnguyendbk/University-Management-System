package com.ptit.studentportal.registration.service;

import com.ptit.studentportal.registration.dto.request.*;
import com.ptit.studentportal.registration.dto.response.*;

import java.util.List;

public interface AdminRegistrationService {
    List<RegistrationSemesterResponse> getRegistrationSemesters();
    void openRegistration(Long semesterId, OpenRegistrationRequest request);
    void closeRegistration(Long semesterId);
    void lockRegistration(Long semesterId);
    
    List<AdminSectionResponse> getAdminSections(Long semesterId);
    AdminSectionResponse createSection(CreateCourseSectionRequest request);
    AdminSectionResponse updateSection(Long sectionId, UpdateCourseSectionRequest request);
    void openSection(Long sectionId);
    void closeSection(Long sectionId);
    void cancelSection(Long sectionId);
    
    List<SectionStudentResponse> getSectionStudents(Long sectionId);
    void sendRegistrationNotification(Long semesterId, SendRegistrationNotificationRequest request);
}
