package com.ptit.studentportal.exam.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LecturerDTO {
    private Long lecturerId;
    private String lecturerCode;
    private String lecturerName;
    private String department;
}
