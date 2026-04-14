package com.ptit.studentportal.user;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum UserStatus {
	ACTIVE,
	INACTIVE,
	LOCKED;

	@JsonCreator
	public static UserStatus fromValue(String value) {
		if (value == null) {
			return null;
		}
		return UserStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
	}
}
