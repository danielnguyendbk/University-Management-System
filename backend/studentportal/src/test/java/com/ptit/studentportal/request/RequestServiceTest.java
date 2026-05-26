package com.ptit.studentportal.request;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.studentgrade.StudentGradesRepository;
import com.ptit.studentportal.user.User;

class RequestServiceTest {

    private StudentRequestRepositoryStub repoStub;
    private LecturerRepositoryStub lecturerStub;
    private StudentRepositoryStub studentStub;
    private RequestTypeRepositoryStub requestTypeStub;
    private StudentGradesRepositoryStub studentGradesStub;
    private RequestService service;

    @BeforeEach
    void setUp() {
        repoStub = new StudentRequestRepositoryStub();
        lecturerStub = new LecturerRepositoryStub();
        studentStub = new StudentRepositoryStub();
        requestTypeStub = new RequestTypeRepositoryStub();
        studentGradesStub = new StudentGradesRepositoryStub();
        service = new RequestService(repoStub.proxy(), lecturerStub.proxy(), studentStub.proxy(), requestTypeStub.proxy(), studentGradesStub.proxy());
    }

    @Test
    void getPendingRequests_mapsRowsToDto() {
        repoStub.pending = List.of(new RequestRowStub(1L, 2001L, "SV01", "Nguyen" , 1L, "TYPE", "Phúc khảo", "Tiêu đề", "Nội dung", null, null, "pending", null, null, LocalDateTime.now()));

        var result = service.getPendingRequests(10L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).requestId());
        assertEquals("pending", result.get(0).status());
    }

    @Test
    void approveRequest_updatesStatus_andReturnsDto() {
        repoStub.requestRow = Optional.of(new RequestRowStub(2L, 2002L, "SV02", "Tran", 1L, "TYPE", "Xin nghỉ", "Tiêu đề", "Nội dung", null, null, "pending", null, null, LocalDateTime.now()));
        repoStub.updateResult = 1;

        var dto = service.approveRequest(5L, 2L, new RequestDecisionRequest("ok"));

        assertEquals(2L, dto.requestId());
        assertEquals("approved", dto.status());
    }

    @Test
    void rejectRequest_whenAlreadyProcessed_throws() {
        repoStub.requestRow = Optional.of(new RequestRowStub(3L, 2003L, "SV03", "Le", 1L, "TYPE", "Xin nghỉ", "Tiêu đề", "Nội dung", null, null, "approved", null, null, LocalDateTime.now()));

        AppException ex = assertThrows(AppException.class, () -> service.rejectRequest(5L, 3L, new RequestDecisionRequest("no")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void getStudentRequests_returnsStudentRows() {
        studentStub.students.add(makeStudent(2001L, "SV01", "Nguyen"));
        repoStub.studentRows = List.of(new RequestRowStub(11L, 2001L, "SV01", "Nguyen", 1L, "leave_request", "Đơn xin nghỉ học", "Tiêu đề", "Nội dung", null, null, "pending", null, null, LocalDateTime.now()));

        var result = service.getStudentRequests(2001L);

        assertEquals(1, result.size());
        assertEquals(11L, result.get(0).requestId());
        assertEquals("pending", result.get(0).status());
    }

    @Test
    void submitStudentRequest_createsPendingRequest() {
        studentStub.students.add(makeStudent(2001L, "SV01", "Nguyen"));
        requestTypeStub.requestType = Optional.of(new RequestType(1L, "leave_request", "Đơn xin nghỉ học"));
        studentGradesStub.rows = List.of(new StudentGradeRowStub(1L, 2001L, 100L, 2026L, "registered", "SE101.1", "CSE101", "Intro to CS"));
        repoStub.requestRow = Optional.of(new RequestRowStub(99L, 2001L, "SV01", "Nguyen", 1L, "leave_request", "Đơn xin nghỉ học", "Nghỉ học do ốm", "Nội dung", null, null, "pending", null, null, LocalDateTime.now()));
        repoStub.savedRequestId = 99L;

        var dto = service.submitStudentRequest(2001L, new StudentRequestCreateRequest("leave_request", "Nghỉ học do ốm", "Vui lòng cho em xin nghỉ", LocalDateTime.now().toLocalDate(), null, 100L, "SE101.1", null, null, null, null));

        assertEquals(99L, dto.requestId());
        assertEquals("pending", dto.status());
    }

    @Test
    void submitStudentRequest_rejectsSectionFromPreviousSemester() {
        studentStub.students.add(makeStudent(2001L, "SV01", "Nguyen"));
        requestTypeStub.requestType = Optional.of(new RequestType(1L, "leave_request", "Đơn xin nghỉ học"));
        studentGradesStub.rows = List.of(
                new StudentGradeRowStub(1L, 2001L, 100L, 2025L, "registered", "SE101.1", "CSE101", "Intro to CS"),
                new StudentGradeRowStub(2L, 2001L, 200L, 2026L, "registered", "SE201.1", "CSE201", "Data Structures")
        );

        AppException ex = assertThrows(AppException.class, () ->
                service.submitStudentRequest(2001L, new StudentRequestCreateRequest("leave_request", "Nghỉ học", "Xin nghỉ", LocalDateTime.now().toLocalDate(), null, 100L, "SE101.1", null, null, null, null)));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    // --- stubs ---
    private static final class StudentRequestRepositoryStub implements InvocationHandler {
        List<StudentRequestRepository.RequestRow> pending = List.of();
        List<StudentRequestRepository.RequestRow> studentRows = List.of();
        Optional<StudentRequestRepository.RequestRow> requestRow = Optional.empty();
        int updateResult = 0;
        Long savedRequestId = 1L;

        StudentRequestRepository proxy() {
            return (StudentRequestRepository) Proxy.newProxyInstance(
                    StudentRequestRepository.class.getClassLoader(),
                    new Class<?>[] { StudentRequestRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            switch (method.getName()) {
                case "findPendingRequests":
                    return pending;
                case "findRequestsByStudentId":
                    return studentRows;
                case "findRequestById":
                    return requestRow;
                case "findAttachmentsByRequestIds":
                    return List.of();
                case "save": {
                    StudentRequest request = (StudentRequest) args[0];
                    request.setRequestId(savedRequestId);
                    return request;
                }
                case "updateRequestStatus": {
                    // args: (Long requestId, String status, Long processedBy)
                    Long requestId = (Long) args[0];
                    String status = (String) args[1];
                    // update stored requestRow to reflect new status so subsequent getRequestById sees it
                    if (requestRow.isPresent()) {
                        StudentRequestRepository.RequestRow prev = requestRow.get();
                        requestRow = Optional.of(new RequestRowStub(
                            requestId,
                            prev.getStudentId(),
                            prev.getStudentCode(),
                            prev.getStudentName(),
                            prev.getRequestTypeId(),
                            prev.getRequestTypeCode(),
                            prev.getRequestTypeName(),
                            prev.getTitle(),
                            prev.getContent(),
                            prev.getSectionId(),
                            prev.getSectionCode(),
                            status,
                            prev.getProcessedBy(),
                            prev.getProcessedAt(),
                            prev.getCreatedAt()
                        ));
                    }
                    return updateResult;
                }
                default:
                    return defaultValue(method.getReturnType());
            }
        }
    }

    private static final class StudentRepositoryStub implements InvocationHandler {
        List<Student> students = new java.util.ArrayList<>();

        StudentRepository proxy() {
            return (StudentRepository) Proxy.newProxyInstance(
                    StudentRepository.class.getClassLoader(),
                    new Class<?>[] { StudentRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            return switch (method.getName()) {
                case "findById" -> {
                    Long studentId = (Long) args[0];
                    yield students.stream().filter(student -> studentId.equals(student.getStudentId())).findFirst();
                }
                default -> defaultValue(method.getReturnType());
            };
        }
    }

    private static final class RequestTypeRepositoryStub implements InvocationHandler {
        Optional<RequestType> requestType = Optional.empty();

        RequestTypeRepository proxy() {
            return (RequestTypeRepository) Proxy.newProxyInstance(
                    RequestTypeRepository.class.getClassLoader(),
                    new Class<?>[] { RequestTypeRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            return switch (method.getName()) {
                case "findByRequestTypeCode" -> requestType;
                default -> defaultValue(method.getReturnType());
            };
        }
    }

    private static final class StudentGradesRepositoryStub implements InvocationHandler {
        List<StudentGradesRepository.StudentGradeRow> rows = List.of();

        StudentGradesRepository proxy() {
            return (StudentGradesRepository) Proxy.newProxyInstance(
                    StudentGradesRepository.class.getClassLoader(),
                    new Class<?>[] { StudentGradesRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            return switch (method.getName()) {
                case "findStudentGradeRows" -> rows;
                default -> defaultValue(method.getReturnType());
            };
        }
    }

    private static final class StudentGradeRowStub implements StudentGradesRepository.StudentGradeRow {
        private final Long enrollmentId;
        private final Long studentId;
        private final Long sectionId;
        private final Long semesterId;
        private final String enrollmentStatus;
        private final String sectionCode;
        private final String courseCode;
        private final String courseName;

        StudentGradeRowStub(Long enrollmentId, Long studentId, Long sectionId, Long semesterId, String enrollmentStatus, String sectionCode, String courseCode, String courseName) {
            this.enrollmentId = enrollmentId;
            this.studentId = studentId;
            this.sectionId = sectionId;
            this.semesterId = semesterId;
            this.enrollmentStatus = enrollmentStatus;
            this.sectionCode = sectionCode;
            this.courseCode = courseCode;
            this.courseName = courseName;
        }

        @Override public Long getEnrollmentId() { return enrollmentId; }
        @Override public Long getStudentId() { return studentId; }
        @Override public Long getSectionId() { return sectionId; }
        @Override public String getEnrollmentStatus() { return enrollmentStatus; }
        @Override public String getSectionCode() { return sectionCode; }
        @Override public Long getSemesterId() { return semesterId; }
        @Override public String getSemesterName() { return null; }
        @Override public String getAcademicYear() { return null; }
        @Override public String getCourseCode() { return courseCode; }
        @Override public String getCourseName() { return courseName; }
        @Override public Integer getCredits() { return null; }
        @Override public Long getGradeId() { return null; }
        @Override public java.math.BigDecimal getAttendanceScore() { return null; }
        @Override public java.math.BigDecimal getExerciseScore() { return null; }
        @Override public java.math.BigDecimal getPracticeScore() { return null; }
        @Override public java.math.BigDecimal getMidtermScore() { return null; }
        @Override public java.math.BigDecimal getFinalScore() { return null; }
        @Override public java.math.BigDecimal getTotalScore() { return null; }
    }

    private static Student makeStudent(Long studentId, String code, String name) {
        Student student = new Student();
        student.setStudentId(studentId);
        student.setStudentCode(code);
        student.setFullName(name);
        return student;
    }

    private static final class RequestRowStub implements StudentRequestRepository.RequestRow {
        private final Long requestId;
        private final Long studentId;
        private final String studentCode;
        private final String studentName;
        private final Long requestTypeId;
        private final String requestTypeCode;
        private final String requestTypeName;
        private final String title;
        private final String content;
        private final Long sectionId;
        private final String sectionCode;
        private final String status;
        private final Long processedBy;
        private final LocalDateTime processedAt;
        private final LocalDateTime createdAt;

        RequestRowStub(Long requestId, Long studentId, String studentCode, String studentName, Long requestTypeId, String requestTypeCode, String requestTypeName, String title, String content, Long sectionId, String sectionCode, String status, Long processedBy, LocalDateTime processedAt, LocalDateTime createdAt) {
            this.requestId = requestId;
            this.studentId = studentId;
            this.studentCode = studentCode;
            this.studentName = studentName;
            this.requestTypeId = requestTypeId;
            this.requestTypeCode = requestTypeCode;
            this.requestTypeName = requestTypeName;
            this.title = title;
            this.content = content;
            this.sectionId = sectionId;
            this.sectionCode = sectionCode;
            this.status = status;
            this.processedBy = processedBy;
            this.processedAt = processedAt;
            this.createdAt = createdAt;
        }

        @Override public Long getRequestId() { return requestId; }
        @Override public Long getStudentId() { return studentId; }
        @Override public String getStudentCode() { return studentCode; }
        @Override public String getStudentName() { return studentName; }
        @Override public Long getRequestTypeId() { return requestTypeId; }
        @Override public String getRequestTypeCode() { return requestTypeCode; }
        @Override public String getRequestTypeName() { return requestTypeName; }
        @Override public String getTitle() { return title; }
        @Override public String getContent() { return content; }
        @Override public Long getSectionId() { return sectionId; }
        @Override public String getSectionCode() { return sectionCode; }
        @Override public String getStatus() { return status; }
        @Override public Long getProcessedBy() { return processedBy; }
        @Override public LocalDateTime getProcessedAt() { return processedAt; }
        @Override public LocalDateTime getCreatedAt() { return createdAt; }
    }

    private static final class LecturerRepositoryStub implements InvocationHandler {
        boolean exists = true;
        Lecturer lecturer = new Lecturer();

        LecturerRepository proxy() {
            // ensure lecturer has a user with id to avoid NPE in tests
            com.ptit.studentportal.user.User u = new com.ptit.studentportal.user.User();
            u.setUserId(12345L);
            lecturer.setUser(u);

            return (LecturerRepository) Proxy.newProxyInstance(
                    LecturerRepository.class.getClassLoader(),
                    new Class<?>[] { LecturerRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            return switch (method.getName()) {
                case "findById" -> Optional.of(lecturer);
                default -> defaultValue(method.getReturnType());
            };
        }
    }

    private static Object defaultValue(Class<?> type) {
        if (!type.isPrimitive()) {
            return null;
        }
        if (type == boolean.class) {
            return false;
        }
        if (type == byte.class) {
            return (byte) 0;
        }
        if (type == short.class) {
            return (short) 0;
        }
        if (type == int.class) {
            return 0;
        }
        if (type == long.class) {
            return 0L;
        }
        if (type == float.class) {
            return 0F;
        }
        if (type == double.class) {
            return 0D;
        }
        if (type == char.class) {
            return '\0';
        }
        return null;
    }
}
