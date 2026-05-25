package com.ptit.studentportal.timetable.service.impl;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import com.ptit.studentportal.timetable.dto.response.TimetableItemResponse;
import com.ptit.studentportal.timetable.dto.response.ClassSessionViewProjection;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.service.TimetableQueryService;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.timetable.repository.SemesterWeekRepository;
import com.ptit.studentportal.timetable.dto.response.ScheduleViewProjection;
import com.ptit.studentportal.timetable.entity.SemesterWeek;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;

import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.dto.response.SectionTimetableOptionResponse;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.timetable.service.TimetableCommandService;


@Service
public class TimetableQueryServiceImpl implements TimetableQueryService {

    private final ClassSessionRepository classSessionRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ScheduleRepository scheduleRepository;
    private final SemesterWeekRepository semesterWeekRepository;
    private final SemesterRepository semesterRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final LecturerRepository lecturerRepository;
    private final TimetableCommandService timetableCommandService;

    public TimetableQueryServiceImpl(
            ClassSessionRepository classSessionRepository,
            UserRepository userRepository,
            StudentRepository studentRepository,
            ScheduleRepository scheduleRepository,
            SemesterWeekRepository semesterWeekRepository,
            SemesterRepository semesterRepository,
            CourseSectionRepository courseSectionRepository,
            LecturerRepository lecturerRepository,
            TimetableCommandService timetableCommandService
    ) {
        this.classSessionRepository = classSessionRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.scheduleRepository = scheduleRepository;
        this.semesterWeekRepository = semesterWeekRepository;
        this.semesterRepository = semesterRepository;
        this.courseSectionRepository = courseSectionRepository;
        this.lecturerRepository = lecturerRepository;
        this.timetableCommandService = timetableCommandService;
    }

    @Override
    public List<TimetableItemResponse> getStudentTimetable(Long studentId, LocalDate fromDate, LocalDate toDate) {
        // 1. Try class_sessions first
        List<ClassSessionViewProjection> sessions = classSessionRepository.findStudentTimetable(studentId, fromDate, toDate);
        if (!sessions.isEmpty()) {
            return sessions.stream()
                    .map(s -> TimetableItemResponse.builder()
                            .sessionId(s.getSessionId())
                            .sectionId(s.getSectionId())
                            .sectionCode(s.getSectionCode())
                            .courseCode(s.getCourseCode())
                            .courseName(s.getCourseName())
                            .roomCode(s.getRoomCode())
                            .lecturerName(s.getLecturerName())
                            .sessionDate(s.getSessionDate())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .slotStart(s.getSlotStart())
                            .slotEnd(s.getSlotEnd())
                            .sessionStatus(s.getSessionStatus())
                            .sessionType(s.getSessionType())
                            .practiceGroupNo(s.getPracticeGroupNo())
                            .note(s.getNote())
                            .practice(s.getSessionType() != null && s.getSessionType().equalsIgnoreCase("PRACTICE"))
                            .build())
                    .collect(Collectors.toList());
        }

        // 2. Fallback to schedules
        List<ScheduleViewProjection> schedules = scheduleRepository.findStudentSchedules(studentId);
        if (schedules.isEmpty()) {
            return Collections.emptyList();
        }

        // Get weeks that overlap with the date range
        // Note: The repository method doesn't exist yet, I'll use a manual filter or add it
        List<SemesterWeek> weeks = semesterWeekRepository.findAll().stream()
                .filter(w -> !w.getStartDate().isAfter(toDate) && !w.getEndDate().isBefore(fromDate))
                .collect(Collectors.toList());

        List<TimetableItemResponse> fallbackList = new ArrayList<>();
        for (SemesterWeek week : weeks) {
            for (ScheduleViewProjection sch : schedules) {
                // Check if week is within schedule range
                if (week.getWeekNo() >= sch.getFromWeekNo() && week.getWeekNo() <= sch.getToWeekNo()) {
                    // Calculate sessionDate
                    DayOfWeek targetDay = parseDayOfWeek(sch.getDayOfWeek());
                    if (targetDay != null) {
                        // Find the date for this day of week within the week's range
                        LocalDate sessionDate = null;
                        LocalDate curr = week.getStartDate();
                        while (!curr.isAfter(week.getEndDate())) {
                            if (curr.getDayOfWeek() == targetDay) {
                                sessionDate = curr;
                                break;
                            }
                            curr = curr.plusDays(1);
                        }
                        
                        // Verify sessionDate is found and within the requested range
                        if (sessionDate != null && !sessionDate.isBefore(fromDate) && !sessionDate.isAfter(toDate)) {
                            
                            fallbackList.add(TimetableItemResponse.builder()
                                    .sectionId(sch.getSectionId())
                                    .sectionCode(sch.getSectionCode())
                                    .courseCode(sch.getCourseCode())
                                    .courseName(sch.getCourseName())
                                    .roomCode(sch.getRoomCode())
                                    .roomName(sch.getRoomName())
                                    .lecturerName(sch.getLecturerName())
                                    .sessionDate(sessionDate)
                                    .startTime(sch.getStartTime())
                                    .endTime(sch.getEndTime())
                                    .slotStart(sch.getSlotStart())
                                    .slotEnd(sch.getSlotEnd())
                                    .sessionStatus("scheduled")
                                    .sessionType(sch.getSessionType())
                                    .practiceGroupNo(sch.getPracticeGroupNo())
                                    .note(sch.getNote())
                                    .practice(sch.getSessionType() != null && sch.getSessionType().equalsIgnoreCase("PRACTICE"))
                                    .build());
                        }
                    }
                }
            }
        }

        return fallbackList.stream()
                .sorted((a, b) -> {
                    int dateCompare = a.sessionDate().compareTo(b.sessionDate());
                    if (dateCompare != 0) return dateCompare;
                    return a.startTime().compareTo(b.startTime());
                })
                .collect(Collectors.toList());
    }

    private DayOfWeek parseDayOfWeek(String dow) {
        if (dow == null) return null;
        return switch (dow.toUpperCase()) {
            case "MON", "MONDAY" -> DayOfWeek.MONDAY;
            case "TUE", "TUESDAY" -> DayOfWeek.TUESDAY;
            case "WED", "WEDNESDAY" -> DayOfWeek.WEDNESDAY;
            case "THU", "THURSDAY" -> DayOfWeek.THURSDAY;
            case "FRI", "FRIDAY" -> DayOfWeek.FRIDAY;
            case "SAT", "SATURDAY" -> DayOfWeek.SATURDAY;
            case "SUN", "SUNDAY" -> DayOfWeek.SUNDAY;
            default -> null;
        };
    }

    @Override
    public List<TimetableItemResponse> getStudentTimetableByUsername(String username, LocalDate fromDate, LocalDate toDate) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return Collections.emptyList();
        }

        Student student = studentRepository.findByUser_UserId(user.getUserId()).orElse(null);
        if (student == null) {
            return Collections.emptyList();
        }

        return getStudentTimetable(student.getStudentId(), fromDate, toDate);
    }

    @Override
    public List<TimetableItemResponse> getLecturerTimetable(Long lecturerId, LocalDate fromDate, LocalDate toDate) {
        // 1. Try class_sessions first
        List<ClassSessionViewProjection> sessions = classSessionRepository.findLecturerTimetable(lecturerId, fromDate, toDate);
        if (!sessions.isEmpty()) {
            return sessions.stream()
                    .map(s -> TimetableItemResponse.builder()
                            .sessionId(s.getSessionId())
                            .sectionId(s.getSectionId())
                            .sectionCode(s.getSectionCode())
                            .courseCode(s.getCourseCode())
                            .courseName(s.getCourseName())
                            .roomCode(s.getRoomCode())
                            .lecturerName(s.getLecturerName())
                            .sessionDate(s.getSessionDate())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .slotStart(s.getSlotStart())
                            .slotEnd(s.getSlotEnd())
                            .sessionStatus(s.getSessionStatus())
                            .sessionType(s.getSessionType())
                            .practiceGroupNo(s.getPracticeGroupNo())
                            .note(s.getNote())
                            .practice(s.getSessionType() != null && s.getSessionType().equalsIgnoreCase("PRACTICE"))
                            .build())
                    .collect(Collectors.toList());
        }

        // 2. Fallback to schedules
        List<ScheduleViewProjection> schedules = scheduleRepository.findLecturerSchedules(lecturerId);
        if (schedules.isEmpty()) {
            return Collections.emptyList();
        }

        // Get weeks that overlap with the date range
        List<SemesterWeek> weeks = semesterWeekRepository.findAll().stream()
                .filter(w -> !w.getStartDate().isAfter(toDate) && !w.getEndDate().isBefore(fromDate))
                .collect(Collectors.toList());

        List<TimetableItemResponse> fallbackList = new ArrayList<>();
        for (SemesterWeek week : weeks) {
            for (ScheduleViewProjection sch : schedules) {
                // Check if week is within schedule range
                if (week.getWeekNo() >= sch.getFromWeekNo() && week.getWeekNo() <= sch.getToWeekNo()) {
                    // Calculate sessionDate
                    DayOfWeek targetDay = parseDayOfWeek(sch.getDayOfWeek());
                    if (targetDay != null) {
                        // Find the date for this day of week within the week's range
                        LocalDate sessionDate = null;
                        LocalDate curr = week.getStartDate();
                        while (!curr.isAfter(week.getEndDate())) {
                            if (curr.getDayOfWeek() == targetDay) {
                                sessionDate = curr;
                                break;
                            }
                            curr = curr.plusDays(1);
                        }
                        
                        // Verify sessionDate is found and within the requested range
                        if (sessionDate != null && !sessionDate.isBefore(fromDate) && !sessionDate.isAfter(toDate)) {
                            
                            fallbackList.add(TimetableItemResponse.builder()
                                    .sectionId(sch.getSectionId())
                                    .sectionCode(sch.getSectionCode())
                                    .courseCode(sch.getCourseCode())
                                    .courseName(sch.getCourseName())
                                    .roomCode(sch.getRoomCode())
                                    .roomName(sch.getRoomName())
                                    .lecturerName(sch.getLecturerName())
                                    .sessionDate(sessionDate)
                                    .startTime(sch.getStartTime())
                                    .endTime(sch.getEndTime())
                                    .slotStart(sch.getSlotStart())
                                    .slotEnd(sch.getSlotEnd())
                                    .sessionStatus("scheduled")
                                    .sessionType(sch.getSessionType())
                                    .practiceGroupNo(sch.getPracticeGroupNo())
                                    .note(sch.getNote())
                                    .practice(sch.getSessionType() != null && sch.getSessionType().equalsIgnoreCase("PRACTICE"))
                                    .build());
                        }
                    }
                }
            }
        }

        return fallbackList.stream()
                .sorted((a, b) -> {
                    int dateCompare = a.sessionDate().compareTo(b.sessionDate());
                    if (dateCompare != 0) return dateCompare;
                    return a.startTime().compareTo(b.startTime());
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TimetableItemResponse> getLecturerTimetableByUsername(String username, LocalDate fromDate, LocalDate toDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.ptit.studentportal.commom.exception.AppException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Không tìm thấy hồ sơ giảng viên cho tài khoản hiện tại"
                ));

        Lecturer lecturer = lecturerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new com.ptit.studentportal.commom.exception.AppException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Không tìm thấy hồ sơ giảng viên cho tài khoản hiện tại"
                ));

        return getLecturerTimetable(lecturer.getLecturerId(), fromDate, toDate);
    }

    @Override
    public List<TimetableItemResponse> getAdminTimetable(LocalDate fromDate, LocalDate toDate) {
        return Collections.emptyList();
    }

    @Override
    public List<ClassSessionViewProjection> getAdminTimetableView(Long semesterId, Integer weekNo, Long buildingId, Long roomId, String sessionType, Long lecturerId, Long sectionId) {
        return classSessionRepository.findClassSessionsView(semesterId, weekNo, buildingId, roomId, sessionType, lecturerId, sectionId);
    }

    @Override
    public TimetableItemResponse mapScheduleToResponse(Schedule schedule) {
        if (schedule == null) {
            return null;
        }

        return new TimetableItemResponse(
                null,
                schedule.getSectionId(),
                null,
                null,
                null,
                schedule.getRoomId(),
                null,
                null,
                null,
                null,
                null,
                null,
                schedule.getDayOfWeek(),
                null,
                schedule.getPracticeGroupNo(),
                null,
                null,
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getSlotStart(),
                schedule.getSlotEnd(),
                null,
                schedule.getSessionType() != null ? schedule.getSessionType().getDbValue() : null,
                schedule.getSessionType() == com.ptit.studentportal.timetable.enums.SessionType.PRACTICE,
                null,
                schedule.getNote()
        );
    }

    @Override
    public List<SemesterWeek> getSemesterWeeks(Long semesterId) {
        List<SemesterWeek> weeks = semesterWeekRepository.findBySemesterIdOrderByWeekNo(semesterId);
        Semester semester = semesterRepository.findById(semesterId).orElse(null);
        if (semester != null && shouldRegenerateWeeks(semester, weeks)) {
            timetableCommandService.generateSemesterWeeks(semesterId);
            weeks = semesterWeekRepository.findBySemesterIdOrderByWeekNo(semesterId);
        }
        return weeks;
    }

    private boolean shouldRegenerateWeeks(Semester semester, List<SemesterWeek> weeks) {
        LocalDate semesterStartDate = semester.getStartDate();
        LocalDate semesterEndDate = semester.getEndDate();
        if (semesterStartDate == null || semesterEndDate == null) {
            return false;
        }

        LocalDate academicYearStartDate = resolveAcademicYearStartDate(semester);
        int fromWeek = Math.max(1, weekNoForDate(semesterStartDate, academicYearStartDate));
        int toWeek = Math.max(fromWeek, weekNoForDate(semesterEndDate, academicYearStartDate));

        if (weeks == null || weeks.isEmpty()) {
            return true;
        }

        SemesterWeek first = weeks.get(0);
        SemesterWeek last = weeks.get(weeks.size() - 1);
        if (first.getWeekNo() == null || last.getWeekNo() == null) {
            return true;
        }

        if (first.getWeekNo() != fromWeek || last.getWeekNo() != toWeek) {
            return true;
        }

        LocalDate expectedFirstStart = academicYearStartDate.plusDays((long) (fromWeek - 1) * 7);
        LocalDate expectedLastEnd = academicYearStartDate.plusDays((long) (toWeek - 1) * 7 + 6);
        return !expectedFirstStart.equals(first.getStartDate()) || !expectedLastEnd.equals(last.getEndDate());
    }

    private int weekNoForDate(LocalDate date, LocalDate academicYearStartDate) {
        long days = ChronoUnit.DAYS.between(academicYearStartDate, date);
        if (days < 0) {
            return 1;
        }
        return (int) (days / 7) + 1;
    }

    private LocalDate resolveAcademicYearStartDate(Semester semester) {
        String semesterYear = semester.getSemesterYear();
        if (semesterYear != null && semesterYear.contains("-")) {
            String startYearStr = semesterYear.split("-")[0].trim();
            try {
                int startYear = Integer.parseInt(startYearStr);
                return LocalDate.of(startYear, 8, 11);
            } catch (NumberFormatException ignored) {
                // Fall back to semester start date when semesterYear is not parseable.
            }
        }

        LocalDate semesterStartDate = semester.getStartDate();
        if (semesterStartDate == null) {
            return LocalDate.of(LocalDate.now().getYear(), 8, 11);
        }
        LocalDate candidate = LocalDate.of(semesterStartDate.getYear(), 8, 11);
        if (semesterStartDate.isBefore(candidate)) {
            candidate = candidate.minusYears(1);
        }
        return candidate;
    }

    @Override
    public List<SectionTimetableOptionResponse> getSectionOptions(Long semesterId) {
        return courseSectionRepository.findSectionOptions(semesterId).stream()
                .map(o -> new SectionTimetableOptionResponse(
                        o.getSectionId(),
                        o.getSectionCode(),
                        o.getCourseCode(),
                        o.getCourseName(),
                        o.getLecturerName(),
                        o.getStatus()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<TimetableItemResponse> getSectionTimetable(Long sectionId, LocalDate fromDate, LocalDate toDate) {
        // 1. Try class_sessions first
        List<ClassSessionViewProjection> sessions = classSessionRepository.findSectionTimetable(sectionId, fromDate, toDate);
        if (!sessions.isEmpty()) {
            return sessions.stream()
                    .map(s -> TimetableItemResponse.builder()
                            .sessionId(s.getSessionId())
                            .sectionId(s.getSectionId())
                            .sectionCode(s.getSectionCode())
                            .courseCode(s.getCourseCode())
                            .courseName(s.getCourseName())
                            .roomCode(s.getRoomCode())
                            .lecturerName(s.getLecturerName())
                            .sessionDate(s.getSessionDate())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .slotStart(s.getSlotStart())
                            .slotEnd(s.getSlotEnd())
                            .sessionStatus(s.getSessionStatus())
                            .sessionType(s.getSessionType())
                            .practiceGroupNo(s.getPracticeGroupNo())
                            .note(s.getNote())
                            .practice(s.getSessionType() != null && s.getSessionType().equalsIgnoreCase("PRACTICE"))
                            .build())
                    .collect(Collectors.toList());
        }

        // 2. Fallback to schedules
        List<ScheduleViewProjection> schedules = scheduleRepository.findSectionSchedules(sectionId);
        if (schedules.isEmpty()) {
            return Collections.emptyList();
        }

        // Get weeks that overlap with the date range
        List<SemesterWeek> weeks = semesterWeekRepository.findAll().stream()
                .filter(w -> !w.getStartDate().isAfter(toDate) && !w.getEndDate().isBefore(fromDate))
                .collect(Collectors.toList());

        List<TimetableItemResponse> fallbackList = new ArrayList<>();
        for (SemesterWeek week : weeks) {
            for (ScheduleViewProjection sch : schedules) {
                // Check if week is within schedule range
                if (week.getWeekNo() >= sch.getFromWeekNo() && week.getWeekNo() <= sch.getToWeekNo()) {
                    // Calculate sessionDate
                    DayOfWeek targetDay = parseDayOfWeek(sch.getDayOfWeek());
                    if (targetDay != null) {
                        // Find the date for this day of week within the week's range
                        LocalDate sessionDate = null;
                        LocalDate curr = week.getStartDate();
                        while (!curr.isAfter(week.getEndDate())) {
                            if (curr.getDayOfWeek() == targetDay) {
                                sessionDate = curr;
                                break;
                            }
                            curr = curr.plusDays(1);
                        }
                        
                        // Verify sessionDate is found and within the requested range
                        if (sessionDate != null && !sessionDate.isBefore(fromDate) && !sessionDate.isAfter(toDate)) {
                            
                            fallbackList.add(TimetableItemResponse.builder()
                                    .sectionId(sch.getSectionId())
                                    .sectionCode(sch.getSectionCode())
                                    .courseCode(sch.getCourseCode())
                                    .courseName(sch.getCourseName())
                                    .roomCode(sch.getRoomCode())
                                    .roomName(sch.getRoomName())
                                    .lecturerName(sch.getLecturerName())
                                    .sessionDate(sessionDate)
                                    .startTime(sch.getStartTime())
                                    .endTime(sch.getEndTime())
                                    .slotStart(sch.getSlotStart())
                                    .slotEnd(sch.getSlotEnd())
                                    .sessionStatus("scheduled")
                                    .sessionType(sch.getSessionType())
                                    .practiceGroupNo(sch.getPracticeGroupNo())
                                    .note(sch.getNote())
                                    .practice(sch.getSessionType() != null && sch.getSessionType().equalsIgnoreCase("PRACTICE"))
                                    .build());
                        }
                    }
                }
            }
        }

        return fallbackList.stream()
                .sorted((a, b) -> {
                    int dateCompare = a.sessionDate().compareTo(b.sessionDate());
                    if (dateCompare != 0) return dateCompare;
                    return a.startTime().compareTo(b.startTime());
                })
                .collect(Collectors.toList());
    }
}
