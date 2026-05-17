package com.ptit.studentportal.admin.common;

import java.util.List;

public record ImportResult(
		int success,
		int failed,
		List<ImportErrorItem> errors
) {
}