package com.ptit.studentportal.exam.service;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.exam.dto.*;
import com.ptit.studentportal.exam.entity.Exam;
import com.ptit.studentportal.exam.entity.ExamInvigilator;
import com.ptit.studentportal.exam.entity.ExamInvigilatorId;
import com.ptit.studentportal.exam.repository.ExamInvigilatorRepository;
import com.ptit.studentportal.exam.repository.ExamRepository;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.registration.entity.Enrollment;
import com.ptit.studentportal.registration.repository.EnrollmentRepository;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.entity.Course;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Room;
import com.ptit.studentportal.timetable.entity.Building;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.enums.SessionStatus;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.repository.CourseRepository;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.RoomRepository;
import com.ptit.studentportal.timetable.repository.BuildingRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamInvigilatorRepository examInvigilatorRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final SemesterRepository semesterRepository;
    private final LecturerRepository lecturerRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClassSessionRepository classSessionRepository;
    private final UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Get list of exams by semester, including dynamic constraint audits
     */
    @Transactional(readOnly = true)
    public List<ExamResponse> getExams(Long semesterId) {
        List<Exam> exams = examRepository.findBySemesterId(semesterId);
        return exams.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Fetch list of eligible course sections with registered candidates
     */
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<EligibleSectionResponse> getEligibleSections(Long semesterId) {
        String sql = """
            SELECT
                cs.section_id,
                cs.section_code,
                c.course_code,
                c.course_name,
                cs.semester_id,
                cs.lecturer_id,
                l.full_name AS lecturer_name,
                COUNT(e.enrollment_id) AS student_count
            FROM course_sections cs
            JOIN courses c ON cs.course_id = c.course_id
            LEFT JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
            JOIN enrollments e ON e.section_id = cs.section_id
               AND e.enrollment_status IN ('registered', 'completed')
            LEFT JOIN exams ex ON ex.section_id = cs.section_id
               AND ex.status <> 'cancel'
            WHERE cs.semester_id = :semesterId
              AND cs.status <> 'cancelled'
              AND ex.exam_id IS NULL
            GROUP BY
                cs.section_id,
                cs.section_code,
                c.course_code,
                c.course_name,
                cs.semester_id,
                cs.lecturer_id,
                l.full_name
            HAVING COUNT(e.enrollment_id) > 0
            ORDER BY c.course_code, cs.section_code
            """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("semesterId", semesterId);

        List<Object[]> results = query.getResultList();
        List<EligibleSectionResponse> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(EligibleSectionResponse.builder()
                .sectionId(((Number) row[0]).longValue())
                .sectionCode((String) row[1])
                .courseCode((String) row[2])
                .courseName((String) row[3])
                .semesterId(((Number) row[4]).longValue())
                .lecturerId(row[5] != null ? ((Number) row[5]).longValue() : null)
                .lecturerName((String) row[6])
                .studentCount(((Number) row[7]).longValue())
                .build());
        }
        return list;
    }

    /**
     * Load rooms
     */
    @Transactional(readOnly = true)
    public List<RoomDTO> getRooms() {
        return roomRepository.findAll().stream().map(r -> {
            String bCode = "";
            if (r.getBuildingId() != null) {
                bCode = buildingRepository.findById(r.getBuildingId())
                    .map(Building::getBuildingCode)
                    .orElse("");
            }
            return RoomDTO.builder()
                .roomId(r.getRoomId())
                .roomCode(r.getRoomCode())
                .building(bCode)
                .capacity(r.getCapacity())
                .build();
        }).collect(Collectors.toList());
    }

    /**
     * Load lecturers
     */
    @Transactional(readOnly = true)
    public List<LecturerDTO> getLecturers() {
        return lecturerRepository.findAll().stream().map(l -> LecturerDTO.builder()
            .lecturerId(l.getLecturerId())
            .lecturerCode(l.getLecturerCode())
            .lecturerName(l.getFullName())
            .department(l.getAcademicTitle() != null ? l.getAcademicTitle() : "")
            .build()
        ).collect(Collectors.toList());
    }

    /**
     * Create exam under standard validation rules
     */
    public ExamResponse createExam(ExamCreateRequest request) {
        validateExamRequest(request, null);
        LocalTime start = LocalTime.parse(request.getStartTime());
        LocalTime end = LocalTime.parse(request.getEndTime());
        validateInvigilators(request.getInvigilators(), request.getSectionId(), request.getExamDate(), start, end, request.getStatus(), null);

        Long mainLecturerId = null;
        if (request.getInvigilators() != null) {
            for (ExamCreateRequest.InvigilatorRequest inv : request.getInvigilators()) {
                if (inv.getRole() != null) {
                    String r = inv.getRole().trim().toUpperCase();
                    if (r.contains("MAIN") || r.contains("CHÍNH")) {
                        inv.setRole("MAIN");
                    } else {
                        inv.setRole("ASSISTANT");
                    }
                } else {
                    inv.setRole("ASSISTANT");
                }
                if ("MAIN".equals(inv.getRole())) {
                    mainLecturerId = inv.getLecturerId();
                }
            }
        }

        Exam exam = Exam.builder()
            .semesterId(request.getSemesterId())
            .sectionId(request.getSectionId())
            .roomId(request.getRoomId())
            .proctorLecturerId(mainLecturerId)
            .examType(normalizeExamType(request.getExamType()))
            .examMethod(normalizeExamMethod(request.getExamMethod()))
            .examDate(request.getExamDate())
            .startTime(start)
            .endTime(end)
            .seatRange(request.getSeatRange())
            .studentCount(request.getStudentCount())
            .status(normalizeExamStatus(request.getStatus(), "scheduled"))
            .note(request.getNote())
            .build();

        Exam saved = examRepository.save(exam);

        if (request.getInvigilators() != null) {
            for (ExamCreateRequest.InvigilatorRequest inv : request.getInvigilators()) {
                if (inv.getLecturerId() == null) continue;
                ExamInvigilator eInv = ExamInvigilator.builder()
                    .examId(saved.getExamId())
                    .lecturerId(inv.getLecturerId())
                    .role(normalizeInvigilatorRole(inv.getRole()))
                    .note(inv.getNote())
                    .build();
                examInvigilatorRepository.save(eInv);
            }
        }

        return mapToResponse(saved);
    }

    /**
     * Edit exam under standard validation rules
     */
    public ExamResponse updateExam(Long examId, ExamCreateRequest request) {
        Exam existing = examRepository.findById(examId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch thi."));

        validateExamRequest(request, examId);
        LocalTime start = LocalTime.parse(request.getStartTime());
        LocalTime end = LocalTime.parse(request.getEndTime());
        validateInvigilators(request.getInvigilators(), request.getSectionId(), request.getExamDate(), start, end, request.getStatus(), examId);

        boolean replaceInvigilators = request.getInvigilators() != null;
        Long mainLecturerId = existing.getProctorLecturerId();
        if (request.getInvigilators() != null) {
            mainLecturerId = null;
            for (ExamCreateRequest.InvigilatorRequest inv : request.getInvigilators()) {
                if (inv.getRole() != null) {
                    String r = inv.getRole().trim().toUpperCase();
                    if (r.contains("MAIN") || r.contains("CHÍNH")) {
                        inv.setRole("MAIN");
                    } else {
                        inv.setRole("ASSISTANT");
                    }
                } else {
                    inv.setRole("ASSISTANT");
                }
                if ("MAIN".equals(inv.getRole())) {
                    mainLecturerId = inv.getLecturerId();
                }
            }
        }

        existing.setRoomId(request.getRoomId());
        if (replaceInvigilators) {
            existing.setProctorLecturerId(mainLecturerId);
        }
        existing.setExamType(normalizeExamType(request.getExamType()));
        existing.setExamMethod(normalizeExamMethod(request.getExamMethod()));
        existing.setExamDate(request.getExamDate());
        existing.setStartTime(start);
        existing.setEndTime(end);
        existing.setSeatRange(request.getSeatRange());
        existing.setStudentCount(request.getStudentCount());
        existing.setStatus(normalizeExamStatus(request.getStatus(), "scheduled"));
        existing.setNote(request.getNote());

        Exam saved = examRepository.save(existing);

        if (replaceInvigilators) {
            examInvigilatorRepository.deleteByExamId(examId);
            for (ExamCreateRequest.InvigilatorRequest inv : request.getInvigilators()) {
                if (inv.getLecturerId() == null) continue;
                ExamInvigilator eInv = ExamInvigilator.builder()
                    .examId(examId)
                    .lecturerId(inv.getLecturerId())
                    .role(normalizeInvigilatorRole(inv.getRole()))
                    .note(inv.getNote())
                    .build();
                examInvigilatorRepository.save(eInv);
            }
        }

        return mapToResponse(saved);
    }

    /**
     * Cancel an exam
     */
    public ExamResponse cancelExam(Long examId) {
        Exam existing = examRepository.findById(examId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch thi."));
        existing.setStatus("cancel");
        return mapToResponse(examRepository.save(existing));
    }

    /**
     * Delete exam completely
     */
    public void deleteExam(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch thi.");
        }
        examInvigilatorRepository.deleteByExamId(examId);
        examRepository.deleteById(examId);
    }

    /**
     * Assign Invigilator
     */
    public ExamResponse assignInvigilator(Long examId, InvigilatorAssignRequest request) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch thi."));

        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giảng viên."));

        // Validate overlap in invigilation duties
        validateLecturerOverlap(request.getLecturerId(), exam.getExamDate(), exam.getStartTime(), exam.getEndTime(), examId);

        // Validate that invigilator is not the teaching lecturer of this section
        CourseSection section = courseSectionRepository.findById(exam.getSectionId()).orElse(null);
        if (section != null && request.getLecturerId().equals(section.getLecturerId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Giảng viên không được coi thi lớp học phần do chính mình phụ trách.");
        }

        String normalizedRole = normalizeInvigilatorRole(request.getRole());
        ExamInvigilator inv = ExamInvigilator.builder()
            .examId(examId)
            .lecturerId(request.getLecturerId())
            .role(normalizedRole)
            .note(request.getNote())
            .build();

        examInvigilatorRepository.save(inv);

        // Update proctorLecturerId if role is MAIN
        if ("main".equals(normalizedRole)) {
            exam.setProctorLecturerId(request.getLecturerId());
            examRepository.save(exam);
        }

        return mapToResponse(exam);
    }

    private void validateInvigilators(List<ExamCreateRequest.InvigilatorRequest> invs, Long sectionId, LocalDate date, LocalTime start, LocalTime end, String status, Long excludeExamId) {
        if (invs == null) {
            if ("SCHEDULED".equalsIgnoreCase(status)) {
                if (excludeExamId != null) {
                    long mainCount = examInvigilatorRepository.countMainInvigilatorsByExamId(excludeExamId);
                    if (mainCount == 0) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Lịch thi đã lên lịch cần có giám thị chính.");
                    }
                } else {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Lịch thi đã lên lịch cần có giám thị chính.");
                }
            }
            return;
        }
        if (invs.isEmpty()) {
            if ("SCHEDULED".equalsIgnoreCase(status)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Lá»‹ch thi Ä‘Ã£ lÃªn lá»‹ch cáº§n cÃ³ giÃ¡m thá»‹ chÃ­nh.");
            }
            return;
        }

        CourseSection section = courseSectionRepository.findById(sectionId).orElse(null);
        Long teachingLecturerId = section != null ? section.getLecturerId() : null;

        boolean hasMain = false;
        java.util.Set<Long> lecturerIds = new java.util.HashSet<>();

        for (ExamCreateRequest.InvigilatorRequest inv : invs) {
            if (inv.getLecturerId() == null) continue;

            // Rule 1: No duplicates
            if (!lecturerIds.add(inv.getLecturerId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Giảng viên này đã được phân công trong ca thi.");
            }

            // Rule 2: Cannot invigilate own teaching section
            if (teachingLecturerId != null && inv.getLecturerId().equals(teachingLecturerId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Giảng viên không được coi thi lớp học phần do chính mình phụ trách.");
            }

            // Rule 3: Lecturer overlap (invigilation or teaching)
            validateLecturerOverlap(inv.getLecturerId(), date, start, end, excludeExamId);

            String role = inv.getRole() != null ? inv.getRole().trim().toUpperCase() : "ASSISTANT";
            if (role.contains("MAIN") || role.contains("CHÍNH")) {
                hasMain = true;
            }
        }

        if ("SCHEDULED".equalsIgnoreCase(status) && !hasMain) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Lịch thi đã lên lịch cần có giám thị chính.");
        }
    }

    /**
     * Remove Invigilator
     */
    public ExamResponse removeInvigilator(Long examId, Long lecturerId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch thi."));

        examInvigilatorRepository.deleteByExamIdAndLecturerId(examId, lecturerId);
        if (lecturerId.equals(exam.getProctorLecturerId())) {
            Long nextMainLecturerId = examInvigilatorRepository.findByExamId(examId).stream()
                .filter(inv -> "main".equalsIgnoreCase(inv.getRole()))
                .map(ExamInvigilator::getLecturerId)
                .findFirst()
                .orElse(null);
            exam.setProctorLecturerId(nextMainLecturerId);
            examRepository.save(exam);
        }
        return mapToResponse(exam);
    }

    /**
     * Get exams for student
     */
    @Transactional(readOnly = true)
    public List<ExamResponse> getStudentExams(String username, Long semesterId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản sinh viên."));

        Student student = studentRepository.findByUser_UserId(user.getUserId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên tương ứng."));

        List<Exam> exams = examRepository.findStudentExams(student.getStudentId(), semesterId);
        return exams.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Get exams for lecturer
     */
    @Transactional(readOnly = true)
    public List<ExamResponse> getLecturerExams(String username, Long semesterId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản giảng viên."));

        Lecturer lecturer = lecturerRepository.findByUser_UserId(user.getUserId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ giảng viên tương ứng."));

        List<ExamInvigilator> invs = examInvigilatorRepository.findByLecturerId(lecturer.getLecturerId());
        List<Exam> exams = new ArrayList<>();
        java.util.Map<Long, ExamInvigilator> invMap = new java.util.HashMap<>();
        for (ExamInvigilator inv : invs) {
            Optional<Exam> opt = examRepository.findById(inv.getExamId());
            if (opt.isPresent()) {
                Exam exam = opt.get();
                if (semesterId.equals(exam.getSemesterId()) && "scheduled".equalsIgnoreCase(exam.getStatus())) {
                    exams.add(exam);
                    invMap.put(inv.getExamId(), inv);
                }
            }
        }
        return exams.stream().map(e -> {
            ExamResponse res = this.mapToResponse(e);
            ExamInvigilator myInv = invMap.get(e.getExamId());
            if (myInv != null) {
                res.setInvigilatorRole(toUiInvigilatorRole(myInv.getRole()));
                res.setInvigilatorNote(myInv.getNote());
            }
            return res;
        }).collect(Collectors.toList());
    }

    /**
     * Validate All exam Creation/Update constraints
     */
    private void validateExamRequest(ExamCreateRequest request, Long excludeExamId) {
        // Rule 6: start_time < end_time
        LocalTime start = LocalTime.parse(request.getStartTime());
        LocalTime end = LocalTime.parse(request.getEndTime());
        if (!start.isBefore(end)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
        }

        // Load CourseSection
        CourseSection section = courseSectionRepository.findById(request.getSectionId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học phần."));

        long activeExamsCount = examRepository.countActiveExamsForSection(request.getSectionId(), excludeExamId);
        if (activeExamsCount > 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Lớp học phần này đã có lịch thi. Mỗi lớp học phần chỉ được tạo một lịch thi.");
        }

        // Rule 1: Section must belong to selected semester
        if (!section.getSemesterId().equals(request.getSemesterId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Lớp học phần không thuộc học kỳ đang chọn.");
        }

        // Rule 7: exam_date must fall within semester bounds
        Semester sem = semesterRepository.findById(request.getSemesterId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy học kỳ."));
        if (request.getExamDate().isBefore(sem.getStartDate()) || request.getExamDate().isAfter(sem.getEndDate())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ngày thi phải nằm trong khoảng thời gian của học kỳ.");
        }

        // Load Enrolled Student size
        Integer studentCount = enrollmentRepository.countStudentsForSection(request.getSectionId());
        if (studentCount == null || studentCount == 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Lớp học phần này chưa có sinh viên đăng ký nên không thể tạo lịch thi.");
        }

        // Set backend-calculated student count and set seatRange to null
        request.setStudentCount(studentCount);
        request.setSeatRange(null);

        // Load Room capacity
        Room room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng thi."));

        // Validate Room capacity
        if (studentCount > room.getCapacity()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phòng thi không đủ sức chứa cho số sinh viên của lớp học phần.");
        }

        List<Enrollment> enrollments = enrollmentRepository.findBySectionId(request.getSectionId()).stream()
            .filter(e -> "registered".equalsIgnoreCase(e.getEnrollmentStatus()) || "completed".equalsIgnoreCase(e.getEnrollmentStatus()))
            .toList();

        // Rule 8: Room clash check
        List<Exam> overlappingRoomExams = examRepository.findOverlappingRoomExams(
            request.getRoomId(), request.getExamDate(), start, end, excludeExamId
        );
        if (!overlappingRoomExams.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phòng thi đã có lịch thi khác trùng khoảng thời gian này.");
        }

        // Rule 9: Student schedule clash check
        for (Enrollment en : enrollments) {
            List<Exam> studentExams = examRepository.findActiveExamsForStudent(en.getStudentId());
            for (Exam se : studentExams) {
                if (excludeExamId != null && se.getExamId().equals(excludeExamId)) continue;
                if (isTimeOverlap(request.getExamDate(), start, end, se.getExamDate(), se.getStartTime(), se.getEndTime())) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Sinh viên " + en.getStudentId() + " bị trùng lịch thi ở lớp học phần khác.");
                }
            }
        }
    }

    /**
     * Validate Lecturer overlaps (duties or teaching)
     */
    private void validateLecturerOverlap(Long lecturerId, LocalDate date, LocalTime start, LocalTime end, Long excludeExamId) {
        // check invigilation overlaps
        List<ExamInvigilator> duties = examInvigilatorRepository.findByLecturerId(lecturerId);
        for (ExamInvigilator duty : duties) {
            if (excludeExamId != null && duty.getExamId().equals(excludeExamId)) continue;
            Exam ex = examRepository.findById(duty.getExamId()).orElse(null);
            if (ex != null && !"cancel".equalsIgnoreCase(ex.getStatus())) {
                if (isTimeOverlap(date, start, end, ex.getExamDate(), ex.getStartTime(), ex.getEndTime())) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Giảng viên coi thi bị trùng lịch coi thi với ca thi khác.");
                }
            }
        }

        // check teaching overlaps
        List<ClassSession> classes = classSessionRepository.findByLecturerIdAndSessionDateBetween(lecturerId, date, date);
        for (ClassSession cs : classes) {
            if (cs.getSessionStatus() != SessionStatus.CANCELLED) {
                LocalTime classStart = cs.getStartTime();
                LocalTime classEnd = cs.getEndTime();
                if (classStart != null && classEnd != null) {
                    if (isTimeOverlap(date, start, end, date, classStart, classEnd)) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Giảng viên coi thi bị trùng lịch dạy học phần.");
                    }
                }
            }
        }
    }

    private boolean isTimeOverlap(LocalDate d1, LocalTime s1, LocalTime e1, LocalDate d2, LocalTime s2, LocalTime e2) {
        if (!d1.equals(d2)) return false;
        return !(s1.isAfter(e2) || s1.equals(e2) || e1.isBefore(s2) || e1.equals(s2));
    }

    /**
     * Maps an Exam entity to its rich ExamResponse DTO representation
     */
    private ExamResponse mapToResponse(Exam exam) {
        CourseSection section = courseSectionRepository.findById(exam.getSectionId()).orElse(null);
        Course course = section != null ? courseRepository.findById(section.getCourseId()).orElse(null) : null;
        Room room = roomRepository.findById(exam.getRoomId()).orElse(null);

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        List<ExamResponse.InvigilatorResponse> invs = examInvigilatorRepository.findByExamId(exam.getExamId()).stream().map(inv -> {
            Lecturer l = lecturerRepository.findById(inv.getLecturerId()).orElse(null);
            return ExamResponse.InvigilatorResponse.builder()
                .lecturerId(inv.getLecturerId())
                .lecturerCode(l != null ? l.getLecturerCode() : "")
                .lecturerName(l != null ? l.getFullName() : "")
                .role(toUiInvigilatorRole(inv.getRole()))
                .note(inv.getNote())
                .build();
        }).collect(Collectors.toList());

        // Perform dynamic auditing to flag warnings/errors
        List<ExamResponse.ConstraintResponse> constraints = new ArrayList<>();
        if (invs.isEmpty() && !"draft".equalsIgnoreCase(exam.getStatus())) {
            constraints.add(ExamResponse.ConstraintResponse.builder()
                .type("missing_data")
                .severity("WARNING")
                .message("Ca thi chưa được phân công cán bộ coi thi (giám thị).")
                .build());
        }

        String bCode = "";
        if (room != null && room.getBuildingId() != null) {
            bCode = buildingRepository.findById(room.getBuildingId())
                .map(Building::getBuildingCode)
                .orElse("");
        }

        return ExamResponse.builder()
            .examId(exam.getExamId())
            .semesterId(exam.getSemesterId())
            .sectionId(exam.getSectionId())
            .sectionCode(section != null ? section.getSectionCode() : "")
            .courseCode(course != null ? course.getCourseCode() : "")
            .courseName(course != null ? course.getCourseName() : "")
            .roomId(exam.getRoomId())
            .roomCode(room != null ? room.getRoomCode() : "Chưa xếp")
            .building(bCode)
            .examType(exam.getExamType())
            .examMethod(toUiExamMethod(exam.getExamMethod()))
            .examDate(exam.getExamDate())
            .startTime(exam.getStartTime().format(timeFormatter))
            .endTime(exam.getEndTime().format(timeFormatter))
            .seatRange(exam.getSeatRange())
            .studentCount(exam.getStudentCount())
            .status(toUiExamStatus(exam.getStatus()))
            .note(exam.getNote())
            .invigilators(invs)
            .constraints(constraints)
            .build();
    }

    private String normalizeExamStatus(String status, String defaultValue) {
        if (status == null || status.isBlank()) {
            return defaultValue;
        }
        String normalized = status.trim().toLowerCase();
        return switch (normalized) {
            case "cancelled", "canceled", "cancel" -> "cancel";
            case "draft", "scheduled", "completed" -> normalized;
            default -> normalized;
        };
    }

    private String normalizeExamMethod(String method) {
        return method == null || method.isBlank() ? null : method.trim().toLowerCase();
    }

    private String normalizeExamType(String type) {
        return type == null || type.isBlank() ? null : type.trim().toLowerCase();
    }

    private String normalizeInvigilatorRole(String role) {
        if (role == null || role.isBlank()) {
            return "assistant";
        }
        String normalized = role.trim().toLowerCase();
        return (normalized.contains("main") || normalized.contains("chinh") || normalized.contains("chÃ­nh")) ? "main" : "assistant";
    }

    private String toUiExamStatus(String status) {
        if (status == null) {
            return null;
        }
        return switch (status.trim().toLowerCase()) {
            case "draft" -> "DRAFT";
            case "scheduled" -> "SCHEDULED";
            case "cancel", "cancelled", "canceled" -> "CANCELLED";
            case "completed" -> "COMPLETED";
            default -> status;
        };
    }

    private String toUiExamMethod(String method) {
        return method == null ? null : method.trim().toUpperCase();
    }

    private String toUiInvigilatorRole(String role) {
        return "main".equalsIgnoreCase(role) ? "MAIN" : "ASSISTANT";
    }
}
