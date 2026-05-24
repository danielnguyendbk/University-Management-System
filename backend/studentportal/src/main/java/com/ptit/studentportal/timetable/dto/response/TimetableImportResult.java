package com.ptit.studentportal.timetable.dto.response;

import java.util.List;

import lombok.Builder;

@Builder
public record TimetableImportResult(
		Integer totalRows,
		Integer successRows,
		Integer errorRows,
		List<TimetableImportError> errors,
		List<TimetableImportRowResult> importedRows
) {
}

