package com.ptit.studentportal.tuition.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.studentportal.tuition.config.PaymentProperties;
import com.ptit.studentportal.tuition.config.SepayProperties;
import com.ptit.studentportal.tuition.dto.SepayWebhookPayload;
import com.ptit.studentportal.tuition.entity.Payment;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.repository.PaymentRepository;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import com.ptit.studentportal.tuition.service.SepayWebhookService.SepayWebhookValidationException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SepayWebhookServiceTest {

    private static final String EXACT_SEPAY_PAYLOAD = """
            {
              "gateway": "BIDV",
              "transactionDate": "2026-05-25 16:20:57",
              "accountNumber": "6930302808",
              "subAccount": "96247C4YH",
              "code": null,
              "content": "13063897456 0345194705 HP1D22KH002",
              "transferType": "in",
              "description": "BankAPINotify 13063897456 0345194705 HP1D22KH002",
              "transferAmount": 2000,
              "referenceCode": "d4d1caee-20a7-4207-8bf-75ede8d775af",
              "accumulated": 0,
              "id": 6041162
            }
            """;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void handleWebhookWithDemoAmountPersistsValidJsonAndMarksPaid() throws Exception {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        TuitionFeeRepository tuitionFeeRepository = mock(TuitionFeeRepository.class);
        SepayWebhookService service = new SepayWebhookService(
                paymentRepository,
                tuitionFeeRepository,
                new SepayProperties(),
                demoPaymentProperties(true),
                objectMapper
        );

        SepayWebhookPayload payload = objectMapper.readValue(EXACT_SEPAY_PAYLOAD, SepayWebhookPayload.class);
        Payment payment = pendingPayment(new BigDecimal("12500000"));
        TuitionFee tuitionFee = tuitionFee(new BigDecimal("12500000"));

        when(paymentRepository.findByTransactionCode("6041162")).thenReturn(Optional.empty());
        when(paymentRepository.findByOrderCode("HP1D22KH002")).thenReturn(Optional.of(payment));
        when(tuitionFeeRepository.findById(7L)).thenReturn(Optional.of(tuitionFee));

        boolean handled = service.handleWebhook(payload, null);

        assertTrue(handled);
        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());

        Payment savedPayment = paymentCaptor.getValue();
        JsonNode rawPayload = assertDoesNotThrow(() -> objectMapper.readTree(savedPayment.getRawWebhookPayload()));
        assertEquals("BIDV", rawPayload.get("gateway").asText());
        assertEquals(6041162L, rawPayload.get("id").asLong());
        assertEquals(2000L, rawPayload.get("transferAmount").asLong());
        assertEquals("success", savedPayment.getPaymentStatus());
        assertEquals("6041162", savedPayment.getTransactionCode());
        assertEquals(0, payment.getAmount().compareTo(tuitionFee.getPaidAmount()));
        assertEquals("paid", tuitionFee.getStatus());
    }

    @Test
    void handleWebhookInNormalModeRejectsMismatchedAmountBeforeSaving() throws Exception {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        TuitionFeeRepository tuitionFeeRepository = mock(TuitionFeeRepository.class);
        SepayWebhookService service = new SepayWebhookService(
                paymentRepository,
                tuitionFeeRepository,
                new SepayProperties(),
                demoPaymentProperties(false),
                objectMapper
        );

        SepayWebhookPayload payload = objectMapper.readValue(EXACT_SEPAY_PAYLOAD, SepayWebhookPayload.class);
        Payment payment = pendingPayment(new BigDecimal("12500000"));

        when(paymentRepository.findByTransactionCode("6041162")).thenReturn(Optional.empty());
        when(paymentRepository.findByOrderCode("HP1D22KH002")).thenReturn(Optional.of(payment));

        SepayWebhookValidationException exception = assertThrows(
                SepayWebhookValidationException.class,
                () -> service.handleWebhook(payload, null)
        );

        assertEquals("amount_mismatch", exception.getErrorCode());
        assertEquals(0, new BigDecimal("2000").compareTo(exception.getTransferredAmount()));
        assertEquals(0, payment.getAmount().compareTo(exception.getExpectedAmount()));
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(tuitionFeeRepository, never()).save(any(TuitionFee.class));
    }

    @Test
    void handleWebhookDuplicateTransactionIsIdempotent() throws Exception {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        TuitionFeeRepository tuitionFeeRepository = mock(TuitionFeeRepository.class);
        SepayWebhookService service = new SepayWebhookService(
                paymentRepository,
                tuitionFeeRepository,
                new SepayProperties(),
                demoPaymentProperties(false),
                objectMapper
        );

        SepayWebhookPayload payload = objectMapper.readValue(EXACT_SEPAY_PAYLOAD, SepayWebhookPayload.class);
        when(paymentRepository.findByTransactionCode("6041162")).thenReturn(Optional.of(new Payment()));

        boolean handled = service.handleWebhook(payload, null);

        assertTrue(handled);
        verify(paymentRepository, never()).findByOrderCode(any());
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(tuitionFeeRepository, never()).save(any(TuitionFee.class));
    }

    private PaymentProperties demoPaymentProperties(boolean enabled) {
        PaymentProperties properties = new PaymentProperties();
        properties.setDemoAmountEnabled(enabled);
        properties.setDemoAmount(new BigDecimal("2000"));
        return properties;
    }

    private Payment pendingPayment(BigDecimal amount) {
        TuitionFee linkedTuitionFee = new TuitionFee();
        linkedTuitionFee.setTuitionFeeId(7L);

        Payment payment = new Payment();
        payment.setPaymentId(3L);
        payment.setTuitionFee(linkedTuitionFee);
        payment.setAmount(amount);
        payment.setOrderCode("HP1D22KH002");
        payment.setPaymentStatus("pending");
        return payment;
    }

    private TuitionFee tuitionFee(BigDecimal finalAmount) {
        TuitionFee tuitionFee = new TuitionFee();
        tuitionFee.setTuitionFeeId(7L);
        tuitionFee.setPaidAmount(BigDecimal.ZERO);
        tuitionFee.setFinalAmount(finalAmount);
        tuitionFee.setStatus("unpaid");
        return tuitionFee;
    }
}
