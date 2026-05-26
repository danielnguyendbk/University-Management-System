package com.ptit.studentportal.timetable.enums;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SessionStatus {
	SCHEDULED("scheduled"),
	CANCELLED("cancelled"),
	MAKEUP("makeup"),
	RESCHEDULED("rescheduled"),
	COMPLETED("completed");

	private final String dbValue;

	SessionStatus(String dbValue) {
		this.dbValue = dbValue;
	}

	@JsonCreator
	public static SessionStatus fromValue(String value) {
		if (value == null) {
			return null;
		}
		return SessionStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
	}

	@JsonValue
	public String getDbValue() {
		return dbValue;
	}
}
