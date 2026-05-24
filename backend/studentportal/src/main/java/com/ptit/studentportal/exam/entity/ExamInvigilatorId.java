package com.ptit.studentportal.exam.entity;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamInvigilatorId implements Serializable {
    private Long examId;
    private Long lecturerId;
}
