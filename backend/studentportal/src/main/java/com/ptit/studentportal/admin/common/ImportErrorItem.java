package com.ptit.studentportal.admin.common;

public record ImportErrorItem(
		int row,
		String field,
		String message
) {
}