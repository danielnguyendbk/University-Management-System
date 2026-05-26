package com.ptit.studentportal.commom.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;

public class StructuredApiException extends RuntimeException {

	private final HttpStatus status;
	private final Map<String, Object> body;

	public StructuredApiException(HttpStatus status, Map<String, Object> body) {
		super(body == null ? null : String.valueOf(body.get("message")));
		this.status = status;
		this.body = body;
	}

	public HttpStatus getStatus() {
		return status;
	}

	public Map<String, Object> getBody() {
		return body;
	}
}
