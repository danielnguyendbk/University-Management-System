package com.ptit.studentportal.timetable.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class SessionStatusConverter implements AttributeConverter<SessionStatus, String> {

	@Override
	public String convertToDatabaseColumn(SessionStatus attribute) {
		return attribute == null ? null : attribute.getDbValue();
	}

	@Override
	public SessionStatus convertToEntityAttribute(String dbData) {
		return SessionStatus.fromValue(dbData);
	}
}
