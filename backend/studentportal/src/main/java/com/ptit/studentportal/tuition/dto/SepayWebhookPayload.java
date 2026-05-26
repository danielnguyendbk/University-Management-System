package com.ptit.studentportal.tuition.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Payload từ SePay webhook.
 * Ref: https://docs.sepay.vn/webhooks.html
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SepayWebhookPayload {

    private Long id;

    @JsonProperty("gateway")
    private String gateway;

    @JsonProperty("transactionDate")
    private String transactionDate;

    @JsonProperty("accountNumber")
    private String accountNumber;

    @JsonProperty("subAccount")
    private String subAccount;

    @JsonProperty("code")
    private String code; // Nội dung chuyển khoản - dùng để match orderCode

    @JsonProperty("content")
    private String content; // Full nội dung

    @JsonProperty("transferType")
    private String transferType; // "in" hoặc "out"

    @JsonProperty("description")
    private String description;

    @JsonProperty("transferAmount")
    private Long transferAmount;

    @JsonProperty("referenceCode")
    private String referenceCode;

    @JsonProperty("accumulated")
    private Long accumulated;
}
