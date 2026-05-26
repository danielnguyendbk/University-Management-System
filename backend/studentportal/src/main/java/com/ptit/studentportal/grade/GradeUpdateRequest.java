package com.ptit.studentportal.grade;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public record GradeUpdateRequest(
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "10", inclusive = true) BigDecimal attendanceScore,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "10", inclusive = true) BigDecimal exerciseScore,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "10", inclusive = true) BigDecimal practiceScore,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "10", inclusive = true) BigDecimal midtermScore,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "10", inclusive = true) BigDecimal finalScore,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "100", inclusive = true) BigDecimal attendanceWeight,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "100", inclusive = true) BigDecimal exerciseWeight,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "100", inclusive = true) BigDecimal practiceWeight,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "100", inclusive = true) BigDecimal midtermWeight,
        @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "100", inclusive = true) BigDecimal finalWeight
) {
}