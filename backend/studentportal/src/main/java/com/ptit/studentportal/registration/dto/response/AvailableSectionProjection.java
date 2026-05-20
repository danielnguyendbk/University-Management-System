package com.ptit.studentportal.registration.dto.response;

public interface AvailableSectionProjection {
    Long getSectionId();
    String getSectionCode();
    Long getClassId();
    String getClassCode();
    Long getCourseId();
    String getCourseCode();
    String getCourseName();
    Integer getCredits();
    String getLecturerName();
    Integer getMaxCapacity();
    Integer getCurrentCapacity();
    Integer getRemainingCapacity();
    String getStatus();
}
