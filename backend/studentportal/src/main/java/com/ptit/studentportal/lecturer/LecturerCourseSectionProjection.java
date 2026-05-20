package com.ptit.studentportal.lecturer;

public interface LecturerCourseSectionProjection {
    Long getSectionId();
    String getSectionCode();

    Long getCourseId();
    String getCourseCode();
    String getCourseName();
    Integer getCredits();

    Long getSemesterId();
    String getSemesterCode();
    String getSemesterName();

    Long getClassId();
    String getClassCode();

    Integer getMaxCapacity();
    String getStatus();

    Integer getCurrentCapacity();
    Integer getRemainingCapacity();

    Object getHasSchedule();
    Object getHasGeneratedSessions();
}
