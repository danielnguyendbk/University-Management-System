package com.ptit.studentportal.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelPreviewResponse {
    private boolean success;
    private int totalRows;
    private int validRows;
    private int errorCount;
    private int warningCount;
    private List<ExcelErrorItem> errors;
    private List<ExcelPreviewItem> previewItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExcelErrorItem {
        private String sheet;
        private int rowNumber;
        private String field;
        private String severity;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExcelPreviewItem {
        private String sectionCode;
        private String courseCode;
        private String courseName;
        private String roomCode;
        private LocalDate examDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer studentCount;
        private String status;
    }
}
