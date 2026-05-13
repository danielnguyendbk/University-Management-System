package com.ptit.studentportal.timetable.exception;

import com.ptit.studentportal.timetable.dto.response.TimetableImportResult;

public class TimetableImportTemplateException extends RuntimeException {

	private final TimetableImportResult result;

	public TimetableImportTemplateException(String message, TimetableImportResult result) {
		super(message);
		this.result = result;
	}

	public TimetableImportResult getResult() {
		return result;
	}
}

