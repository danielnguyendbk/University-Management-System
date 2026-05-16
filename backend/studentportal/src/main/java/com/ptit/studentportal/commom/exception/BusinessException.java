package com.ptit.studentportal.commom.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends AppException {

    public BusinessException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }

    public BusinessException(HttpStatus status, String message) {
        super(status, message);
    }
}
