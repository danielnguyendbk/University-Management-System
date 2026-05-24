package com.ptit.studentportal.timetable.enums;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SessionType {
	THEORY("theory"),
	PRACTICE("practice");

	private final String dbValue;

	SessionType(String dbValue) {
		this.dbValue = dbValue;
	}

	@JsonCreator
	public static SessionType fromValue(String value) {
		if (value == null) {
			return null;
		}
		return SessionType.valueOf(value.trim().toUpperCase(Locale.ROOT));
	}

	@JsonValue
	public String getDbValue() {
		return dbValue;
	}
}

