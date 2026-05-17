package com.ptit.studentportal.lecturer;

import java.util.List;

import com.ptit.studentportal.admin.common.ImportErrorItem;

public record LecturerImportSummaryResponse(
		int success,
		int failed,
		List<ImportErrorItem> errors
) {
}