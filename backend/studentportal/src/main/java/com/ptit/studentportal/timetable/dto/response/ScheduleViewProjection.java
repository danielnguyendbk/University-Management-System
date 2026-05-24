package com.ptit.studentportal.timetable.dto.response;

import java.time.LocalTime;

public interface ScheduleViewProjection {
    Long getScheduleId();
    Long getSectionId();
    String getSectionCode();
    String getCourseCode();
    String getCourseName();
    String getRoomCode();
    String getRoomName();
    String getLecturerName();
    String getDayOfWeek();
    Integer getFromWeekNo();
    Integer getToWeekNo();
    Integer getSlotStart();
    Integer getSlotEnd();
    LocalTime getStartTime();
    LocalTime getEndTime();
    String getSessionType();
    Integer getPracticeGroupNo();
    String getNote();
}
