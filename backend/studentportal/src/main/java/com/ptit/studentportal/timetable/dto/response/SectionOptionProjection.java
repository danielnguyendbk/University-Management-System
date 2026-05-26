package com.ptit.studentportal.timetable.dto.response;

public interface SectionOptionProjection {
    Long getSectionId();
    String getSectionCode();
    String getCourseCode();
    String getCourseName();
    String getLecturerName();
    String getStatus();
}
