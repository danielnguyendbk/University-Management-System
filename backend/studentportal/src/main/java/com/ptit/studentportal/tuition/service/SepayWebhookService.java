package com.ptit.studentportal.tuition.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.studentportal.tuition.config.PaymentProperties;
import com.ptit.studentportal.tuition.dto.SepayWebhookPayload;
import com.ptit.studentportal.tuition.entity.Payment;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.repository.PaymentRepository;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import com.ptit.studentportal.tuition.config.SepayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class SepayWebhookService {

    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("HP\\d+[A-Z0-9]+", Pattern.CASE_INSENSITIVE);
    private static final String RAW_WEBHOOK_FALLBACK_JSON = "{\"error\":\"failed_to_serialize_webhook_payload\"}";

    private final PaymentRepository paymentRepository;
    private final TuitionFeeRepository tuitionFeeRepository;
    private final SepayProperties sepayProperties;
    private final PaymentProperties paymentProperties;
    private final ObjectMapper objectMapper;

    @Transactional
    public boolean handleWebhook(SepayWebhookPayload payload, String authorizationHeader) {
        
        // 2. BƯỚC BẢO MẬT: Kiểm tra API Key từ Header SePay bắn sang
        String apiKey = sepayProperties.getWebhookApiKey();
        if (apiKey != null && !apiKey.isBlank()) {
            String expectedHeaderValue = "Apikey " + apiKey;
            if (authorizationHeader == null || !authorizationHeader.equals(expectedHeaderValue)) {
                log.warn("[SePay] Cảnh báo an ninh: Webhook bị từ chối do sai hoặc thiếu API Key trong Header!");
                return false;
            }
        }

        if (payload == null) {
            log.warn("[SePay] Null payload received, ignoring.");
            return false;
        }

        log.info("[SePay] Received webhook: id={}, content='{}', amount={}",
                payload.getId(), payload.getContent(), payload.getTransferAmount());

        // Process only incoming transactions (transferType = "in")
        if (!"in".equalsIgnoreCase(payload.getTransferType())) {
            log.info("[SePay] Ignoring outgoing transaction type={}", payload.getTransferType());
            return true;
        }

        String transactionId = payload.getId() != null ? payload.getId().toString() : payload.getReferenceCode();
        if (transactionId == null || transactionId.isBlank()) {
            log.warn("[SePay] Missing transaction identifier in webhook payload.");
            return false;
        }

        // Idempotency check 1: check if transaction_code is already processed
        Optional<Payment> processedPaymentOpt = paymentRepository.findByTransactionCode(transactionId);
        if (processedPaymentOpt.isPresent()) {
            log.info("[SePay] Transaction {} has already been processed (idempotency match).", transactionId);
            return true;
        }

        // Extract order_code from content/description first; keep code as a final fallback.
        String orderCode = extractOrderCode(payload.getContent());
        if (orderCode == null) {
            orderCode = extractOrderCode(payload.getDescription());
        }
        if (orderCode == null) {
            orderCode = extractOrderCode(payload.getCode());
        }

        if (orderCode == null) {
            log.warn("[SePay] Could not extract order code from content='{}', description='{}' or code='{}'",
                    payload.getContent(), payload.getDescription(), payload.getCode());
            return false;
        }

        log.info("[SePay] Found orderCode={} in webhook. Searching in database...", orderCode);

        Optional<Payment> paymentOpt = paymentRepository.findByOrderCode(orderCode);
        if (paymentOpt.isEmpty()) {
            log.warn("[SePay] No payment found in database with orderCode={}", orderCode);
            return false;
        }

        Payment payment = paymentOpt.get();

        // Idempotency check 2: check if this payment is already success
        if ("success".equalsIgnoreCase(payment.getPaymentStatus())) {
            log.info("[SePay] Payment for orderCode={} is already SUCCESS. Saving transaction code for safety.", orderCode);
            if (payment.getTransactionCode() == null || !payment.getTransactionCode().equals(transactionId)) {
                payment.setTransactionCode(transactionId);
                paymentRepository.save(payment);
            }
            return true;
        }

        if (payload.getTransferAmount() == null) {
            log.warn("[SePay] Missing transferAmount in payload for orderCode={}", orderCode);
            throw new SepayWebhookValidationException(
                    "missing_transfer_amount",
                    "Webhook transferAmount is required.",
                    null,
                    payment.getAmount());
        }

        BigDecimal transferAmount = BigDecimal.valueOf(payload.getTransferAmount());

        // ============================================================
        // DEMO / DEV ONLY — controlled by application.properties:
        //   payment.demo-amount-enabled=true
        //   payment.demo-amount=2000
        //
        // When enabled, a transfer of exactly demoAmount VND is treated
        // as full payment for committee demos / local testing.
        // MUST be false in production.
        // ============================================================
        boolean isDemoAmount = paymentProperties.isDemoAmountEnabled()
                && paymentProperties.getDemoAmount() != null
                && transferAmount.compareTo(paymentProperties.getDemoAmount()) == 0;

        if (isDemoAmount) {
            log.info("[SePay DEMO] Demo-amount match ({} VND). Treating as full payment (DEMO MODE ONLY).",
                    paymentProperties.getDemoAmount());
        } else if (transferAmount.compareTo(payment.getAmount()) != 0) {
            // Normal mode: transferred amount must exactly match the expected order amount.
            log.warn("[SePay] Amount mismatch for orderCode={}: transferred={}, expected={}",
                    orderCode, transferAmount, payment.getAmount());
            throw new SepayWebhookValidationException(
                    "amount_mismatch",
                    "Transfer amount does not match the expected payment amount.",
                    transferAmount,
                    payment.getAmount());
        }

        // Update Payment status (using string statuses)
        payment.setPaymentStatus("success");
        payment.setPaidAt(LocalDateTime.now());
        payment.setTransactionCode(transactionId);
        payment.setRawWebhookPayload(serializeWebhookPayload(payload));
        paymentRepository.save(payment);

        // Update TuitionFee
        TuitionFee tuitionFee = tuitionFeeRepository.findById(payment.getTuitionFee().getTuitionFeeId())
                .orElseThrow(() -> new IllegalStateException("Tuition fee record not found for payment: " + payment.getPaymentId()));

        BigDecimal currentPaid = tuitionFee.getPaidAmount() != null ? tuitionFee.getPaidAmount() : BigDecimal.ZERO;
        
        // BÙA LOGIC CỘNG TIỀN: Nếu là tiền demo, ép hệ thống hiểu là đã đóng đủ số tiền mong muốn (payment.getAmount())
        BigDecimal amountToCalculate = isDemoAmount ? payment.getAmount() : transferAmount;
        BigDecimal newPaid = currentPaid.add(amountToCalculate);
        
        tuitionFee.setPaidAmount(newPaid);

        if (newPaid.compareTo(tuitionFee.getFinalAmount()) >= 0) {
             tuitionFee.setStatus("paid");
        } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
             tuitionFee.setStatus("partical");
        } else {
             tuitionFee.setStatus("unpaid");
        }

        tuitionFeeRepository.save(tuitionFee);
        log.info("[SePay] Payment verified and tuition status updated successfully for orderCode={}", orderCode);
        return true;
    }

    private String serializeWebhookPayload(SepayWebhookPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.warn("[SePay] Could not serialize webhook payload to JSON, using fallback JSON object.", e);
            return RAW_WEBHOOK_FALLBACK_JSON;
        }
    }

    private String extractOrderCode(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        String[] parts = text.trim().split("\\s+");
        if (parts.length > 0) {
            return parts[parts.length - 1].toUpperCase();
        }
        return null;
    }

    public static class SepayWebhookValidationException extends RuntimeException {
        private final String errorCode;
        private final BigDecimal transferredAmount;
        private final BigDecimal expectedAmount;

        public SepayWebhookValidationException(
                String errorCode,
                String message,
                BigDecimal transferredAmount,
                BigDecimal expectedAmount
        ) {
            super(message);
            this.errorCode = errorCode;
            this.transferredAmount = transferredAmount;
            this.expectedAmount = expectedAmount;
        }

        public String getErrorCode() {
            return errorCode;
        }

        public BigDecimal getTransferredAmount() {
            return transferredAmount;
        }

        public BigDecimal getExpectedAmount() {
            return expectedAmount;
        }
    }
}
