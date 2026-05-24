package com.ptit.studentportal.timetable.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class SessionTypeConverter implements AttributeConverter<SessionType, String> {

	@Override
	public String convertToDatabaseColumn(SessionType attribute) {
		return attribute == null ? null : attribute.getDbValue();
	}

	@Override
	public SessionType convertToEntityAttribute(String dbData) {
		return SessionType.fromValue(dbData);
	}
}
