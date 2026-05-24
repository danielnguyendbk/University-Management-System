package com.ptit.studentportal.tuition.controller;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.security.SecurityUtils;
import com.ptit.studentportal.tuition.service.SemesterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/tuition/semesters")
@RequiredArgsConstructor
public class SemesterAdminController {

    private final SemesterService semesterService;
    private final SecurityUtils securityUtils;

    public record PriceUpdateRequest(BigDecimal pricePerCredit) {}

    @PutMapping("/{semesterId}/price")
    public ResponseEntity<ApiResponse<Void>> updatePrice(
            @PathVariable Long semesterId,
            @RequestBody PriceUpdateRequest request
    ) {
        if (request.pricePerCredit() == null || request.pricePerCredit().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Price per credit must be greater than or equal to 0"));
        }
        String adminUsername = securityUtils.getCurrentUsername();
        if (adminUsername == null) {
            adminUsername = "SYSTEM";
        }
        try {
            semesterService.updatePricePerCredit(semesterId, request.pricePerCredit(), adminUsername);
            return ResponseEntity.ok(ApiResponse.success("Updated credit price successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
