package com.ptit.studentportal.tuition.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "sepay")
public class SepayProperties {
    private String vaAccount = "96247C74YH";
    private String bankCode = "BIDV";
    private String accountName = "NGUYEN QUOC THAI";
    private String qrBaseUrl = "https://qr.sepay.vn/img";
    private String webhookApiKey;
}

