package com.ptit.studentportal.timetable.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class CalendarBlockTypeConverter implements AttributeConverter<CalendarBlockType, String> {

	@Override
	public String convertToDatabaseColumn(CalendarBlockType attribute) {
		return attribute == null ? null : attribute.getDbValue();
	}

	@Override
	public CalendarBlockType convertToEntityAttribute(String dbData) {
		return CalendarBlockType.fromValue(dbData);
	}
}
