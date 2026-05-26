package com.ptit.studentportal.registration.enums;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EnrollmentLogAction {
    REGISTER("register"),
    DROP("drop"),
    ADMIN_REGISTER("admin_register"),
    ADMIN_DROP("admin_drop");

    private final String dbValue;

    EnrollmentLogAction(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonCreator
    public static EnrollmentLogAction fromValue(String value) {
        if (value == null) {
            return null;
        }
        return EnrollmentLogAction.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }
}
