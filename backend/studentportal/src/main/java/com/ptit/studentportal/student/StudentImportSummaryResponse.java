package com.ptit.studentportal.student;

import java.util.List;

import com.ptit.studentportal.admin.common.ImportErrorItem;

public record StudentImportSummaryResponse(
		int success,
		int failed,
		List<ImportErrorItem> errors
) {
}