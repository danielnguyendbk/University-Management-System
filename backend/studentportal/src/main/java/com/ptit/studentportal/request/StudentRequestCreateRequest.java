package com.ptit.studentportal.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudentRequestCreateRequest(
        @NotBlank String requestTypeCode,
        @NotBlank @Size(max = 150) String title,
        @NotBlank String content,
        LocalDate fromDate,
        LocalDate toDate,
        Long sectionId,
        String sectionCode,
        String courseCode,
        String courseName,
        String attachmentFileName,
        String attachmentFileUrl
) {
}
