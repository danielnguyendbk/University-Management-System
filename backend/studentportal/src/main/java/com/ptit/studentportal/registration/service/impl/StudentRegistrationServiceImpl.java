package com.ptit.studentportal.registration.service.impl;

import com.ptit.studentportal.commom.exception.BusinessException;
import com.ptit.studentportal.registration.dto.request.RegisterSectionRequest;
import com.ptit.studentportal.registration.dto.response.*;
import com.ptit.studentportal.registration.entity.Enrollment;
import com.ptit.studentportal.registration.entity.EnrollmentLog;
import com.ptit.studentportal.registration.enums.EnrollmentLogAction;
import com.ptit.studentportal.registration.enums.RegistrationStatus;
import com.ptit.studentportal.registration.repository.*;
import com.ptit.studentportal.registration.service.StudentRegistrationService;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Schedule;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.CourseRepository;
import com.ptit.studentportal.timetable.repository.ScheduleRepository;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentRegistrationServiceImpl implements StudentRegistrationService {

    private final EnrollmentRepository enrollmentRepository;
    private final RegCourseSectionRepository sectionRepository;
    private final RegSemesterRepository semesterRepository;
    private final CourseRepository courseRepository;
    private final ScheduleRepository scheduleRepository;
    private final EnrollmentLogRepository logRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;

    @Override
    public List<RegistrationSemesterResponse> getRegistrationSemesters() {
        return semesterRepository.findAll().stream()
                .sorted(Comparator.comparing(Semester::getSemesterId).reversed())
                .map(s -> new RegistrationSemesterResponse(
                        s.getSemesterId(),
                        s.getSemesterCode(),
                        s.getSemesterName(),
                        resolveAcademicYear(s),
                        s.getRegistrationOpen(),
                        s.getRegistrationClose(),
                        s.getRegistrationStatus() == null ? "CLOSED" : s.getRegistrationStatus().name(),
                        s.getStatus() == null ? null : s.getStatus().name()
                ))
                .toList();
    }

    private String resolveAcademicYear(Semester s) {
        if (s.getAcademicYear() != null && !s.getAcademicYear().isBlank()) {
            return s.getAcademicYear();
        }
        return s.getSemesterYear();
    }

    @Override
    public List<AvailableSectionResponse> getAvailableSections(String username, Long semesterId) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return List.of();
        Student student = studentRepository.findByUser_UserId(user.getUserId()).orElse(null);
        if (student == null) return List.of();
        Long studentId = student.getStudentId();
        Long programId = student.getProgramId();

        List<AvailableSectionProjection> projections = sectionRepository.findAvailableSectionsForProgram(programId, semesterId);
        Semester semester = semesterRepository.findById(semesterId).orElse(null);
        
        return projections.stream()
                .map(p -> {
                    boolean alreadyRegistered = enrollmentRepository.findByStudentIdAndSectionId(studentId, p.getSectionId())
                            .map(e -> "registered".equals(e.getEnrollmentStatus())).orElse(false);
                    
                    boolean sameCourseRegistered = !alreadyRegistered && !enrollmentRepository.findRegisteredInSameCourse(studentId, semesterId, p.getCourseId(), p.getSectionId()).isEmpty();
                    
                    int currentCapacity = p.getCurrentCapacity();
                    int remaining = p.getRemainingCapacity();

                    boolean canRegister = semester != null && semester.getRegistrationStatus() == RegistrationStatus.OPEN;
                    if (canRegister) {
                        LocalDateTime now = LocalDateTime.now();
                        if (semester.getRegistrationOpen() != null && now.isBefore(semester.getRegistrationOpen())) canRegister = false;
                        if (semester.getRegistrationClose() != null && now.isAfter(semester.getRegistrationClose())) canRegister = false;
                    }

                    String blockedReason = null;
                    if (!canRegister) blockedReason = "Ngoài thời gian đăng ký";
                    else if (remaining <= 0) { canRegister = false; blockedReason = "Lớp đã đầy"; }
                    else if (alreadyRegistered) { canRegister = false; blockedReason = "Đã đăng ký lớp này"; }
                    else if (sameCourseRegistered) { canRegister = false; blockedReason = "Đã đăng ký lớp khác cùng môn"; }

                    return new AvailableSectionResponse(
                            p.getSectionId(),
                            p.getSectionCode(),
                            p.getClassId(),
                            p.getClassCode(),
                            p.getCourseId(),
                            p.getCourseCode(),
                            p.getCourseName(),
                            p.getCredits(),
                            p.getLecturerName() != null ? p.getLecturerName() : "Chưa phân công",
                            p.getMaxCapacity(),
                            currentCapacity,
                            remaining,
                            p.getStatus(),
                            alreadyRegistered,
                            sameCourseRegistered,
                            getScheduleText(p.getSectionId()),
                            canRegister,
                            blockedReason
                    );
                }).collect(Collectors.toList());
    }

    @Override
    public List<MyEnrollmentResponse> getMySections(String username, Long semesterId) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return List.of();
        Student student = studentRepository.findByUser_UserId(user.getUserId()).orElse(null);
        if (student == null) return List.of();
        Long studentId = student.getStudentId();

        List<Enrollment> enrollments = enrollmentRepository.findByStudentAndSemester(studentId, semesterId);
        Semester semester = semesterRepository.findById(semesterId).orElse(null);

        return enrollments.stream()
                .filter(e -> "registered".equalsIgnoreCase(e.getEnrollmentStatus()))
                .map(e -> {
            var section = sectionRepository.findById(e.getSectionId()).orElse(null);
            var course = section != null ? courseRepository.findById(section.getCourseId()).orElse(null) : null;
            var lecturer = (section != null && section.getLecturerId() != null) ? lecturerRepository.findById(section.getLecturerId()).orElse(null) : null;
            
            String classCode = "";
            if (section != null && section.getClassId() != null) {
                classCode = sectionRepository.findClassCodeById(section.getClassId());
                if (classCode == null) classCode = "";
            }

            boolean canDrop = "registered".equalsIgnoreCase(e.getEnrollmentStatus()) 
                    && semester != null && semester.getRegistrationStatus() == RegistrationStatus.OPEN;
            
            return new MyEnrollmentResponse(
                    e.getEnrollmentId(),
                    e.getSectionId(),
                    section != null ? section.getSectionCode() : "",
                    classCode,
                    course != null ? course.getCourseCode() : "",
                    course != null ? course.getCourseName() : "",
                    course != null ? course.getCredits() : 0,
                    lecturer != null ? lecturer.getFullName() : "Chưa phân công",
                    e.getEnrollmentStatus(),
                    e.getRegisteredAt(),
                    canDrop,
                    getScheduleText(e.getSectionId())
            );
        }).collect(Collectors.toList());
    }

    @Override
    public EnrollmentActionResponse registerSection(String username, Long sectionId) {
        // 1. Find User by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found: " + username));

        // 2. Find Student by user.userId
        Student student = studentRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new BusinessException("Student record not found for user: " + username));

        Long studentId = student.getStudentId();

        // 3. Find CourseSection by sectionId
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException("Lớp học phần không tồn tại"));

        // 3.5. Check if course belongs to student's program courses
        long countInProgram = courseRepository.countByProgramIdAndCourseId(student.getProgramId(), section.getCourseId());
        if (countInProgram == 0) {
            throw new BusinessException("Bạn không được đăng ký môn học ngoài chương trình đào tạo.");
        }

        // 4. Find Semester from section.semesterId
        Semester semester = semesterRepository.findById(section.getSemesterId())
                .orElseThrow(() -> new BusinessException("Học kỳ không tồn tại"));

        // 5. Check semester.registrationStatus == OPEN
        if (semester.getRegistrationStatus() != RegistrationStatus.OPEN) {
            throw new BusinessException("Học kỳ chưa mở đăng ký.");
        }

        // 6. Check registration window
        LocalDateTime now = LocalDateTime.now();
        if (semester.getRegistrationOpen() != null && now.isBefore(semester.getRegistrationOpen())) {
            throw new BusinessException("Chưa đến thời gian đăng ký");
        }
        if (semester.getRegistrationClose() != null && now.isAfter(semester.getRegistrationClose())) {
            throw new BusinessException("Đã hết thời gian đăng ký.");
        }

        // 7. Check courseSection.status == 'open'
        if (!"open".equalsIgnoreCase(section.getStatus())) {
            throw new BusinessException("Lớp học phần không cho phép đăng ký (Status: " + section.getStatus() + ")");
        }

        // 8. Check capacity
        long count = enrollmentRepository.findBySectionIdAndEnrollmentStatus(section.getSectionId(), "registered").size();
        if (count >= section.getMaxCapacity()) {
            throw new BusinessException("Lớp học phần đã đầy.");
        }

        // 9. Check if already registered
        var existing = enrollmentRepository.findByStudentIdAndSectionId(studentId, section.getSectionId());
        if (existing.isPresent() && "registered".equalsIgnoreCase(existing.get().getEnrollmentStatus())) {
            throw new BusinessException("Bạn đã đăng ký lớp học phần này.");
        }

        // 10. Check same course in same semester
        if (!enrollmentRepository.findRegisteredInSameCourse(studentId, semester.getSemesterId(), section.getCourseId(), section.getSectionId()).isEmpty()) {
            throw new BusinessException("Bạn đã đăng ký một lớp khác của cùng môn học.");
        }

        // 11. Check schedule conflict
        validateScheduleConflict(studentId, section);

        // 12. & 13. Update or create enrollment
        Enrollment enrollment;
        if (existing.isPresent()) {
            enrollment = existing.get();
            enrollment.setEnrollmentStatus("registered");
            enrollment.setRegisteredAt(now);
            enrollment.setDroppedAt(null);
            enrollment.setNote(null);
        } else {
            enrollment = Enrollment.builder()
                    .studentId(studentId)
                    .sectionId(section.getSectionId())
                    .enrollmentStatus("registered")
                    .registeredAt(now)
                    .build();
        }

        // 14. Save enrollment
        enrollmentRepository.save(enrollment);

        // 15. Log the action
        logRepository.save(EnrollmentLog.builder()
                .studentId(studentId)
                .sectionId(section.getSectionId())
                .action(EnrollmentLogAction.REGISTER)
                .note("Student registered enrollment")
                .createdAt(now)
                .build());

        // 16. Return response
        return new EnrollmentActionResponse(
                enrollment.getEnrollmentId(),
                section.getSectionId(),
                section.getSectionCode(),
                "Đăng ký học phần thành công"
        );
    }

    @Override
    public EnrollmentActionResponse dropEnrollment(String username, Long enrollmentId) {
        // 1. Find User by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found: " + username));

        // 2. Find Student by user.userId
        Student student = studentRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new BusinessException("Student record not found for user: " + username));

        // 3. Find Enrollment by enrollmentId
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new BusinessException("Enrollment record not found: " + enrollmentId));

        // 4. Check enrollment ownership
        if (!enrollment.getStudentId().equals(student.getStudentId())) {
            throw new BusinessException("You are not allowed to drop this enrollment.");
        }

        // 5. & 6. Get CourseSection and Semester
        CourseSection section = sectionRepository.findById(enrollment.getSectionId())
                .orElseThrow(() -> new BusinessException("Course section not found for this enrollment."));

        Semester semester = semesterRepository.findById(section.getSemesterId())
                .orElseThrow(() -> new BusinessException("Semester not found for this enrollment."));

        // 7. Check semester.registrationStatus == OPEN
        if (semester.getRegistrationStatus() != RegistrationStatus.OPEN) {
            throw new BusinessException("Không thể hủy đăng ký vì học kỳ không còn mở đăng ký.");
        }

        // 8. Check registration window
        LocalDateTime now = LocalDateTime.now();
        if (semester.getRegistrationOpen() != null && now.isBefore(semester.getRegistrationOpen())) {
            throw new BusinessException("Chưa đến thời gian hủy đăng ký.");
        }
        if (semester.getRegistrationClose() != null && now.isAfter(semester.getRegistrationClose())) {
            throw new BusinessException("Đã hết thời gian hủy đăng ký.");
        }

        // 9. Check enrollment.enrollmentStatus == 'registered'
        if (!"registered".equalsIgnoreCase(enrollment.getEnrollmentStatus())) {
            throw new BusinessException("Chỉ có thể hủy lớp đang đăng ký.");
        }

        // 10. Update enrollment
        enrollment.setEnrollmentStatus("Đã hủy");
        enrollment.setDroppedAt(now);
        enrollment.setNote("Dropped by student");

        // 11. Save enrollment
        enrollmentRepository.save(enrollment);

        // 12. Log the action
        logRepository.save(EnrollmentLog.builder()
                .studentId(student.getStudentId())
                .sectionId(enrollment.getSectionId())
                .action(EnrollmentLogAction.DROP)
                .note("Student dropped enrollment")
                .createdAt(now)
                .build());

        // 13. Return response
        return new EnrollmentActionResponse(
                enrollment.getEnrollmentId(),
                section.getSectionId(),
                section.getSectionCode(),
                "Hủy đăng ký học phần thành công"
        );
    }

    private void validateScheduleConflict(Long studentId, CourseSection newSection) {
        List<Schedule> newSchedules = scheduleRepository.findBySectionId(newSection.getSectionId());
        if (newSchedules.isEmpty()) return;

        List<Enrollment> registered = enrollmentRepository.findRegisteredSectionsInSemester(studentId, newSection.getSemesterId(), newSection.getSectionId());
        
        for (Enrollment e : registered) {
            List<Schedule> oldSchedules = scheduleRepository.findBySectionId(e.getSectionId());
            for (Schedule ns : newSchedules) {
                for (Schedule os : oldSchedules) {
                    if (isConflict(ns, os)) {
                        throw new BusinessException("Lịch học bị trùng với lớp " + getCourseCode(e.getSectionId()) + " vào " + ns.getDayOfWeek() + " tiết " + ns.getSlotStart() + "-" + ns.getSlotEnd());
                    }
                }
            }
        }
    }

    private boolean isConflict(Schedule ns, Schedule os) {
        if (!ns.getDayOfWeek().equals(os.getDayOfWeek())) return false;
        
        // Slot overlap: NOT (ns.end < os.start OR ns.start > os.end)
        boolean slotOverlap = !(ns.getSlotEnd() < os.getSlotStart() || ns.getSlotStart() > os.getSlotEnd());
        if (!slotOverlap) return false;

        // Week overlap if available
        if (ns.getFromWeekNo() != null && ns.getToWeekNo() != null && os.getFromWeekNo() != null && os.getToWeekNo() != null) {
            return !(ns.getToWeekNo() < os.getFromWeekNo() || ns.getFromWeekNo() > os.getToWeekNo());
        }
        
        return true;
    }

    private String getCourseCode(Long sectionId) {
        return sectionRepository.findById(sectionId)
                .map(s -> courseRepository.findById(s.getCourseId()).map(c -> c.getCourseCode()).orElse(""))
                .orElse("");
    }

    private String getScheduleText(Long sectionId) {
        List<Schedule> schedules = scheduleRepository.findBySectionId(sectionId);
        if (schedules.isEmpty()) return "Chưa xếp lịch";
        return schedules.stream()
                .map(s -> s.getDayOfWeek() + " tiết " + s.getSlotStart() + "-" + s.getSlotEnd())
                .collect(Collectors.joining(", "));
    }
}
