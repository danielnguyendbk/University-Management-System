package com.ptit.studentportal.tuition.controller;

import com.ptit.studentportal.tuition.config.SepayProperties;
import com.ptit.studentportal.tuition.dto.SepayWebhookPayload;
import com.ptit.studentportal.tuition.service.SepayWebhookService;
import com.ptit.studentportal.tuition.service.SepayWebhookService.SepayWebhookValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments/sepay/webhook")
@RequiredArgsConstructor
public class SepayWebhookController {

    private final SepayWebhookService sepayWebhookService;
    private final SepayProperties sepayProperties;

    @PostMapping
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SepayWebhookPayload payload
    ) {
        String apiKey = sepayProperties.getWebhookApiKey();
        if (apiKey != null && !apiKey.isBlank()) {
            String expected = "Apikey " + apiKey;
            if (!expected.equals(authHeader)) {
                log.warn("[Webhook] Unauthorized SePay callback received: {}", authHeader);
                return ResponseEntity.status(401).body(Map.of("success", false, "error", "unauthorized"));
            }
        }

        try {
            boolean handled = sepayWebhookService.handleWebhook(payload, authHeader);
            if (handled) {
                return ResponseEntity.ok(Map.of("success", true));
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "ignored_or_mismatched"));
        } catch (SepayWebhookValidationException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(validationBody(e));
        } catch (Exception e) {
            log.error("[Webhook] Error processing SePay webhook payload", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    private Map<String, Object> validationBody(SepayWebhookValidationException e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("error", e.getErrorCode());
        body.put("message", e.getMessage());
        if (e.getTransferredAmount() != null) {
            body.put("transferredAmount", e.getTransferredAmount());
        }
        if (e.getExpectedAmount() != null) {
            body.put("expectedAmount", e.getExpectedAmount());
        }
        return body;
    }
}
