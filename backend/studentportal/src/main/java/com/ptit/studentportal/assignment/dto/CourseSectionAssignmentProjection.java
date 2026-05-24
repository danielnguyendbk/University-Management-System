package com.ptit.studentportal.assignment.dto;

public interface CourseSectionAssignmentProjection {
    Long getSectionId();
    String getSectionCode();
    Long getCourseId();
    String getCourseCode();
    String getCourseName();
    Long getClassId();
    String getClassCode();
    Long getLecturerId();
    String getLecturerCode();
    String getLecturerName();
    Integer getMaxCapacity();
    String getStatus();
    Object getHasSchedule();
    Object getHasGeneratedSessions();
}
