package com.ptit.studentportal.registration.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class EnrollmentLogActionConverter implements AttributeConverter<EnrollmentLogAction, String> {

    @Override
    public String convertToDatabaseColumn(EnrollmentLogAction attribute) {
        return attribute == null ? null : attribute.getDbValue();
    }

    @Override
    public EnrollmentLogAction convertToEntityAttribute(String dbData) {
        return EnrollmentLogAction.fromValue(dbData);
    }
}
