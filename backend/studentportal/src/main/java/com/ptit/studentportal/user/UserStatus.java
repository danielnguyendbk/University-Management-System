package com.ptit.studentportal.user;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserStatus {
	ACTIVE("active"),
	INACTIVE("inactive"),
	LOCKED("locked");

	private final String dbValue;

	UserStatus(String dbValue) {
		this.dbValue = dbValue;
	}

	@JsonCreator
	public static UserStatus fromValue(String value) {
		if (value == null) {
			return null;
		}
		return UserStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
	}

	@JsonValue
	public String getDbValue() {
		return dbValue;
	}
}
