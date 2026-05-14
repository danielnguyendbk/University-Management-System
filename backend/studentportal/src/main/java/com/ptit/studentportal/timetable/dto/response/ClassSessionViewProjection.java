package com.ptit.studentportal.timetable.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public interface ClassSessionViewProjection {
    Long getSessionId();
    Long getScheduleId();
    Long getSemesterId();
    Integer getWeekNo();
    LocalDate getSessionDate();
    String getDayOfWeek();
    String getDayOfWeekLabel();
    String getSectionCode();
    String getCourseCode();
    String getCourseName();
    String getRoomCode();
    String getBuildingCode();
    String getBuildingName();
    String getLecturerCode();
    String getLecturerName();
    Integer getSlotStart();
    Integer getSlotEnd();
    LocalTime getStartTime();
    LocalTime getEndTime();
    String getSessionType();
    Integer getPracticeGroupNo();
    String getSessionStatus();
    String getNote();
}
