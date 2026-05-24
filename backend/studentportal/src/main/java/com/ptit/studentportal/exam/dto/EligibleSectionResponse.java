package com.ptit.studentportal.exam.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibleSectionResponse {
    private Long sectionId;
    private String sectionCode;
    private String courseCode;
    private String courseName;
    private Long semesterId;
    private Long lecturerId;
    private String lecturerName;
    private Long studentCount;
}
