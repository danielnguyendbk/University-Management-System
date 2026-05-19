package com.ptit.studentportal.persistence.converter;

import java.util.Locale;

import com.ptit.studentportal.user.UserStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserStatusConverter implements AttributeConverter<UserStatus, String> {

	@Override
	public String convertToDatabaseColumn(UserStatus attribute) {
		return attribute == null ? null : attribute.name().toLowerCase(Locale.ROOT);
	}

	@Override
	public UserStatus convertToEntityAttribute(String dbData) {
		return dbData == null ? null : UserStatus.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
	}
}