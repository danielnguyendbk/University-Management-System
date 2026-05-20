package com.ptit.studentportal.exam.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamCreateRequest {
    private Long semesterId;
    private Long sectionId;
    private Long roomId;
    private String examType;
    private String examMethod;
    private LocalDate examDate;
    private String startTime; // HH:MM
    private String endTime;   // HH:MM
    private String seatRange;
    private Integer studentCount;
    private String status;
    private String note;
    private List<InvigilatorRequest> invigilators;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvigilatorRequest {
        private Long lecturerId;
        private String role;
        private String note;
    }
}
