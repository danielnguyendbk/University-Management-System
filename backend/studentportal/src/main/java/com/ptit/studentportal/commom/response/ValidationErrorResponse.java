package com.ptit.studentportal.commom.response;

import java.util.List;

public record ValidationErrorResponse(
		String field,
		String message
) {
	public record ApiErrors(List<ValidationErrorResponse> errors) {
	}
}