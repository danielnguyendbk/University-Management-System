package com.ptit.studentportal.exam.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvigilatorAssignRequest {
    private Long lecturerId;
    private String role;
    private String note;
}
