package com.ptit.studentportal.course;

import java.util.List;

import com.ptit.studentportal.admin.common.ImportErrorItem;

public record CourseImportResultResponse(
		int totalRows,
		int successCount,
		int failCount,
		List<ImportErrorItem> errors
) {
}
