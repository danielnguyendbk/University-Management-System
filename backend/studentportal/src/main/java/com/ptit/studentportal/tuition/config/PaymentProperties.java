package com.ptit.studentportal.tuition.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment")
public class PaymentProperties {

    // DEMO / DEV ONLY. Keep false in production.
    // When enabled, payment.demo-amount is accepted as full payment for local demos.
    private boolean demoAmountEnabled = false;
    private BigDecimal demoAmount;
}
