package com.ptit.studentportal.persistence.converter;

import java.sql.Date;
import java.time.LocalDate;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class YearToDateConverter implements AttributeConverter<Integer, Date> {

    @Override
    public Date convertToDatabaseColumn(Integer attribute) {
        if (attribute == null) {
            return null;
        }
        LocalDate d = LocalDate.of(attribute, 1, 1);
        return Date.valueOf(d);
    }

    @Override
    public Integer convertToEntityAttribute(Date dbData) {
        if (dbData == null) {
            return null;
        }
        return dbData.toLocalDate().getYear();
    }
}
