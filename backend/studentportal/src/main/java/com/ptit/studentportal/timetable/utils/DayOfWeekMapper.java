package com.ptit.studentportal.timetable.utils;

public class DayOfWeekMapper {

    public static boolean isValidDayOfWeek(String day) {
        if (day == null || day.trim().isEmpty()) {
            return false;
        }
        String d = day.trim().toUpperCase();
        return d.equals("MON") || d.equals("TUE") || d.equals("WED") || 
               d.equals("THU") || d.equals("FRI") || d.equals("SAT") || d.equals("SUN") ||
               d.equals("MONDAY") || d.equals("TUESDAY") || d.equals("WEDNESDAY") || 
               d.equals("THURSDAY") || d.equals("FRIDAY") || d.equals("SATURDAY") || d.equals("SUNDAY");
    }

    public static String mapDayOfWeekToDb(String day) {
        if (day == null || day.trim().isEmpty()) {
            return null;
        }
        String d = day.trim().toUpperCase();
        return switch (d) {
            case "MON", "MONDAY" -> "Mon";
            case "TUE", "TUESDAY" -> "Tue";
            case "WED", "WEDNESDAY" -> "Wed";
            case "THU", "THURSDAY" -> "Thu";
            case "FRI", "FRIDAY" -> "Fri";
            case "SAT", "SATURDAY" -> "Sat";
            case "SUN", "SUNDAY" -> "Sun";
            default -> null;
        };
    }
}
