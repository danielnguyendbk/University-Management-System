package com.ptit.studentportal.persistence.converter;

import java.util.Locale;

import com.ptit.studentportal.student.Student;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StudentGenderConverter implements AttributeConverter<Student.Gender, String> {

	@Override
	public String convertToDatabaseColumn(Student.Gender attribute) {
		return attribute == null ? null : attribute.name().toLowerCase(Locale.ROOT);
	}

	@Override
	public Student.Gender convertToEntityAttribute(String dbData) {
		return dbData == null ? null : Student.Gender.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
	}
}