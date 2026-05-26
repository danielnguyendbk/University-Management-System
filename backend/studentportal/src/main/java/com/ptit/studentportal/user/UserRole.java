package com.ptit.studentportal.user;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
	STUDENT("student"),
	LECTURER("lecturer"),
	ADMIN("admin");

	private final String dbValue;

	UserRole(String dbValue) {
		this.dbValue = dbValue;
	}

	@JsonCreator
	public static UserRole fromValue(String value) {
		if (value == null) {
			return null;
		}
		return UserRole.valueOf(value.trim().toUpperCase(Locale.ROOT));
	}

	@JsonValue
	public String getDbValue() {
		return dbValue;
	}
}
