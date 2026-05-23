package com.ptit.studentportal.tuition.service;

import com.ptit.studentportal.tuition.config.SepayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class SepayQrService {

    private final SepayProperties props;

    public String generateQrImageUrl(String orderCode, Long amount) {
        String qrUrl = UriComponentsBuilder
                .fromUriString(props.getQrBaseUrl())
                .queryParam("acc", props.getVaAccount())
                .queryParam("bank", props.getBankCode())
                .queryParam("amount", 2000)
                .queryParam("des", orderCode)
                .build()
                .encode()
                .toUriString();

        log.info("[SePayQR] Generated QR URL for orderCode={}, amount={}, url={}", orderCode, amount, qrUrl);
        return qrUrl;
    }
}

