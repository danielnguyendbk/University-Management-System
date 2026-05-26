package com.ptit.studentportal.timetable.enums;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CalendarBlockType {
	HOLIDAY("holiday"),
	BREAK("break"),
	EXAM_WEEK("exam_week");

	private final String dbValue;

	CalendarBlockType(String dbValue) {
		this.dbValue = dbValue;
	}

	@JsonCreator
	public static CalendarBlockType fromValue(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return CalendarBlockType.valueOf(value.trim().toUpperCase(Locale.ROOT));
	}

	@JsonValue
	public String getDbValue() {
		return dbValue;
	}
}
