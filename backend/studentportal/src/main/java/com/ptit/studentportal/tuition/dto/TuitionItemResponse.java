package com.ptit.studentportal.tuition.dto;

import java.math.BigDecimal;

public record TuitionItemResponse(
        String courseCode,
        String courseName,
        Integer credits,
        BigDecimal pricePerCredit,
        BigDecimal amount
) {}
