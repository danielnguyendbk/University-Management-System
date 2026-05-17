package com.ptit.studentportal.student;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class AcademicStatusConverter implements AttributeConverter<Student.AcademicStatus, String> {

	@Override
	public String convertToDatabaseColumn(Student.AcademicStatus attribute) {
		return attribute == null ? null : attribute.name().toLowerCase();
	}

	@Override
	public Student.AcademicStatus convertToEntityAttribute(String dbData) {
		return dbData == null ? null : Student.AcademicStatus.fromValue(dbData);
	}
}