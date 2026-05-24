package com.ptit.studentportal.exam.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResponse {
    private Long examId;
    private Long semesterId;
    private Long sectionId;
    private String sectionCode;
    private String courseCode;
    private String courseName;
    private Long roomId;
    private String roomCode;
    private String building;
    private String examType;
    private String examMethod;
    private LocalDate examDate;
    private String startTime; // HH:MM
    private String endTime;   // HH:MM
    private String seatRange;
    private Integer studentCount;
    private String status;
    private String note;
    private String invigilatorRole;
    private String invigilatorNote;
    private List<InvigilatorResponse> invigilators;
    private List<ConstraintResponse> constraints;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvigilatorResponse {
        private Long lecturerId;
        private String lecturerCode;
        private String lecturerName;
        private String role;
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConstraintResponse {
        private String type;     // room_clash, lecturer_clash, student_clash, missing_data, time_clash
        private String severity; // ERROR | WARNING
        private String message;
        private String sectionCode;
        private String courseCode;
        private String roomCode;
        private String examDate;
        private String startTime;
    }
}
