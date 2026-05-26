package com.ptit.studentportal.persistence.converter;

import java.util.Locale;

import com.ptit.studentportal.student.Student;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StudentAcademicStatusConverter implements AttributeConverter<Student.AcademicStatus, String> {

	@Override
	public String convertToDatabaseColumn(Student.AcademicStatus attribute) {
		return attribute == null ? null : attribute.name().toLowerCase(Locale.ROOT);
	}

	@Override
	public Student.AcademicStatus convertToEntityAttribute(String dbData) {
		return dbData == null ? null : Student.AcademicStatus.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
	}
}