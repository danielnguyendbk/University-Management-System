package com.ptit.studentportal.student;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class GenderConverter implements AttributeConverter<Student.Gender, String> {

	@Override
	public String convertToDatabaseColumn(Student.Gender attribute) {
		return attribute == null ? null : attribute.name().toLowerCase();
	}

	@Override
	public Student.Gender convertToEntityAttribute(String dbData) {
		return dbData == null ? null : Student.Gender.fromValue(dbData);
	}
}