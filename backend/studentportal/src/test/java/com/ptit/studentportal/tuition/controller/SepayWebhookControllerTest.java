package com.ptit.studentportal.tuition.controller;

import com.ptit.studentportal.tuition.config.SepayProperties;
import com.ptit.studentportal.tuition.dto.SepayWebhookPayload;
import com.ptit.studentportal.tuition.service.SepayWebhookService;
import com.ptit.studentportal.tuition.service.SepayWebhookService.SepayWebhookValidationException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SepayWebhookControllerTest {

    @Test
    void handleWebhookReturnsClearValidationResponseForAmountMismatch() {
        SepayWebhookService service = mock(SepayWebhookService.class);
        SepayWebhookController controller = new SepayWebhookController(service, new SepayProperties());
        SepayWebhookPayload payload = new SepayWebhookPayload();

        when(service.handleWebhook(payload, null)).thenThrow(new SepayWebhookValidationException(
                "amount_mismatch",
                "Transfer amount does not match the expected payment amount.",
                new BigDecimal("2000"),
                new BigDecimal("12500000")
        ));

        ResponseEntity<Map<String, Object>> response = controller.handleWebhook(null, payload);

        assertEquals(HttpStatus.UNPROCESSABLE_CONTENT, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(false, body.get("success"));
        assertEquals("amount_mismatch", body.get("error"));
        assertEquals(new BigDecimal("2000"), body.get("transferredAmount"));
        assertEquals(new BigDecimal("12500000"), body.get("expectedAmount"));
    }
}
