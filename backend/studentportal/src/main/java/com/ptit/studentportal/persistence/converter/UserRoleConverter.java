package com.ptit.studentportal.persistence.converter;

import java.util.Locale;

import com.ptit.studentportal.user.UserRole;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

	@Override
	public String convertToDatabaseColumn(UserRole attribute) {
		return attribute == null ? null : attribute.name().toLowerCase(Locale.ROOT);
	}

	@Override
	public UserRole convertToEntityAttribute(String dbData) {
		return dbData == null ? null : UserRole.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
	}
}