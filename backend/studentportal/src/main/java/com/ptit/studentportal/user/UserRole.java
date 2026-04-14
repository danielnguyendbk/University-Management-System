package com.ptit.studentportal.user;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum UserRole {
	STUDENT,
	LECTURER,
	ADMIN;

	@JsonCreator
	public static UserRole fromValue(String value) {
		if (value == null) {
			return null;
		}
		return UserRole.valueOf(value.trim().toUpperCase(Locale.ROOT));
	}
}
