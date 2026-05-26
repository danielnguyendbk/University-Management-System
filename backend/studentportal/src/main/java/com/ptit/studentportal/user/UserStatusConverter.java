package com.ptit.studentportal.user;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class UserStatusConverter implements AttributeConverter<UserStatus, String> {

	@Override
	public String convertToDatabaseColumn(UserStatus attribute) {
		return attribute == null ? null : attribute.getDbValue();
	}

	@Override
	public UserStatus convertToEntityAttribute(String dbData) {
		return UserStatus.fromValue(dbData);
	}
}
