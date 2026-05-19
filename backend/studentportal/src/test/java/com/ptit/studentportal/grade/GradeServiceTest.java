package com.ptit.studentportal.grade;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.lecturer.LecturerRepository;

class GradeServiceTest {

    private GradeRepositoryStub gradeRepositoryStub;
    private LecturerRepositoryStub lecturerRepositoryStub;
    private GradeService gradeService;

    @BeforeEach
    void setUp() {
        gradeRepositoryStub = new GradeRepositoryStub();
        lecturerRepositoryStub = new LecturerRepositoryStub();
        gradeService = new GradeService(gradeRepositoryStub.proxy(), lecturerRepositoryStub.proxy());
    }

    @Test
    void getLecturerSections_mapsRepositoryViews() {
        gradeRepositoryStub.lecturerSections = List.of(
                new LecturerSectionViewStub(11L, 21L, 31L, "DB202", "CS101", "Cơ sở dữ liệu", "Học kỳ 2", "2025-2026", 60, "OPEN", BigInteger.valueOf(42))
        );

        var result = gradeService.getLecturerSections(5L);

        assertEquals(1, result.size());
        assertEquals(11L, result.get(0).sectionId());
        assertEquals(42L, result.get(0).currentCapacity());
        assertEquals("DB202", result.get(0).sectionCode());
    }

    @Test
    void updateGrade_calculatesTotalScore_andPersistsRecord() {
        gradeRepositoryStub.gradeDetail = Optional.of(
                new GradeDetailViewStub(0L, 1001L, 2001L, "SV001", "Nguyen Van A", "registered", 3001L,
                        "DB202", "CS101", "Cơ sở dữ liệu", "Học kỳ 2", "2025-2026", 10L,
                        null, null, null, null, null, null)
        );
        gradeRepositoryStub.gradeByEnrollmentId = Optional.empty();

        GradeDTO result = gradeService.updateGrade(10L, 1001L, new GradeUpdateRequest(
                new BigDecimal("8"),
                null,
                null,
                new BigDecimal("7.5"),
                new BigDecimal("9"),
                new BigDecimal("10"),
                new BigDecimal("0"),
                new BigDecimal("0"),
                new BigDecimal("30"),
                new BigDecimal("60")
        ));

        assertEquals(new BigDecimal("8.45"), result.totalScore());
        assertEquals(new BigDecimal("8.00"), gradeRepositoryStub.savedGrade.getAttendanceScore());
        assertEquals(new BigDecimal("7.50"), gradeRepositoryStub.savedGrade.getMidtermScore());
        assertEquals(new BigDecimal("9.00"), gradeRepositoryStub.savedGrade.getFinalScore());
        assertEquals(new BigDecimal("8.45"), gradeRepositoryStub.savedGrade.getTotalScore());
    }

    @Test
    void updateGrade_rejectsWhenWeightsDoNotSumTo100() {
        gradeRepositoryStub.gradeDetail = Optional.of(
                new GradeDetailViewStub(0L, 1001L, 2001L, "SV001", "Nguyen Van A", "registered", 3001L,
                        "DB202", "CS101", "Cơ sở dữ liệu", "Học kỳ 2", "2025-2026", 10L,
                        null, null, null, null, null, null)
        );

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> gradeService.updateGrade(10L, 1001L,
                new GradeUpdateRequest(
                        new BigDecimal("8"),
                        null,
                        null,
                        new BigDecimal("7.5"),
                        new BigDecimal("9"),
                        new BigDecimal("10"),
                        new BigDecimal("0"),
                        new BigDecimal("0"),
                        new BigDecimal("20"),
                        new BigDecimal("60")
                )));

        assertEquals("Tổng trọng số phải bằng 100", exception.getMessage());
    }

    @Test
    void getLecturerSections_rejectsMissingLecturer() {
        lecturerRepositoryStub.existsById = false;

        AppException exception = assertThrows(AppException.class, () -> gradeService.getLecturerSections(999L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    private static final class LecturerRepositoryStub implements InvocationHandler {
        private boolean existsById = true;

        LecturerRepository proxy() {
            return (LecturerRepository) Proxy.newProxyInstance(
                    LecturerRepository.class.getClassLoader(),
                    new Class<?>[] { LecturerRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            return switch (method.getName()) {
                case "existsById" -> existsById;
                default -> defaultValue(method.getReturnType());
            };
        }
    }

    private static final class GradeRepositoryStub implements InvocationHandler {
        private List<GradeRepository.LecturerSectionView> lecturerSections = List.of();
        private List<GradeRepository.GradeDetailView> sectionGrades = List.of();
        private Optional<GradeRepository.GradeDetailView> gradeDetail = Optional.empty();
        private Optional<Grade> gradeByEnrollmentId = Optional.empty();
        private Grade savedGrade;

        GradeRepository proxy() {
            return (GradeRepository) Proxy.newProxyInstance(
                    GradeRepository.class.getClassLoader(),
                    new Class<?>[] { GradeRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            return switch (method.getName()) {
                case "existsSectionOwnedByLecturer" -> true;
                case "findLecturerSections" -> lecturerSections;
                case "findSectionGrades" -> sectionGrades;
                case "findGradeDetailByEnrollmentId" -> gradeDetail;
                case "findByEnrollmentId" -> gradeByEnrollmentId;
                case "save" -> {
                    Grade grade = (Grade) args[0];
                    if (grade.getGradeId() == null) {
                        grade.setGradeId(999L);
                    }
                    savedGrade = grade;
                    yield grade;
                }
                default -> defaultValue(method.getReturnType());
            };
        }
    }

    private static final class LecturerSectionViewStub implements GradeRepository.LecturerSectionView {
        private final Long sectionId;
        private final Long courseId;
        private final Long semesterId;
        private final String sectionCode;
        private final String courseCode;
        private final String courseName;
        private final String semesterName;
        private final String academicYear;
        private final Integer maxCapacity;
        private final String status;
        private final BigInteger currentCapacity;

        private LecturerSectionViewStub(Long sectionId, Long courseId, Long semesterId, String sectionCode, String courseCode,
                String courseName, String semesterName, String academicYear, Integer maxCapacity, String status,
                BigInteger currentCapacity) {
            this.sectionId = sectionId;
            this.courseId = courseId;
            this.semesterId = semesterId;
            this.sectionCode = sectionCode;
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.semesterName = semesterName;
            this.academicYear = academicYear;
            this.maxCapacity = maxCapacity;
            this.status = status;
            this.currentCapacity = currentCapacity;
        }

        @Override
        public Long getSectionId() {
            return sectionId;
        }

        @Override
        public Long getCourseId() {
            return courseId;
        }

        @Override
        public Long getSemesterId() {
            return semesterId;
        }

        @Override
        public String getSectionCode() {
            return sectionCode;
        }

        @Override
        public String getCourseCode() {
            return courseCode;
        }

        @Override
        public String getCourseName() {
            return courseName;
        }

        @Override
        public String getSemesterName() {
            return semesterName;
        }

        @Override
        public String getAcademicYear() {
            return academicYear;
        }

        @Override
        public Integer getMaxCapacity() {
            return maxCapacity;
        }

        @Override
        public String getStatus() {
            return status;
        }

        @Override
        public BigInteger getCurrentCapacity() {
            return currentCapacity;
        }
    }

    private static final class GradeDetailViewStub implements GradeRepository.GradeDetailView {
        private final Long gradeId;
        private final Long enrollmentId;
        private final Long studentId;
        private final String studentCode;
        private final String studentName;
        private final String enrollmentStatus;
        private final Long sectionId;
        private final String sectionCode;
        private final String courseCode;
        private final String courseName;
        private final String semesterName;
        private final String academicYear;
        private final Long lecturerId;
        private final BigDecimal attendanceScore;
        private final BigDecimal exerciseScore;
        private final BigDecimal practiceScore;
        private final BigDecimal midtermScore;
        private final BigDecimal finalScore;
        private final BigDecimal totalScore;

        private GradeDetailViewStub(Long gradeId, Long enrollmentId, Long studentId, String studentCode, String studentName,
                String enrollmentStatus, Long sectionId, String sectionCode, String courseCode, String courseName,
                String semesterName, String academicYear, Long lecturerId, BigDecimal attendanceScore,
                BigDecimal exerciseScore, BigDecimal practiceScore, BigDecimal midtermScore, BigDecimal finalScore,
                BigDecimal totalScore) {
            this.gradeId = gradeId;
            this.enrollmentId = enrollmentId;
            this.studentId = studentId;
            this.studentCode = studentCode;
            this.studentName = studentName;
            this.enrollmentStatus = enrollmentStatus;
            this.sectionId = sectionId;
            this.sectionCode = sectionCode;
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.semesterName = semesterName;
            this.academicYear = academicYear;
            this.lecturerId = lecturerId;
            this.attendanceScore = attendanceScore;
            this.exerciseScore = exerciseScore;
            this.practiceScore = practiceScore;
            this.midtermScore = midtermScore;
            this.finalScore = finalScore;
            this.totalScore = totalScore;
        }

        @Override
        public Long getGradeId() {
            return gradeId;
        }

        @Override
        public Long getEnrollmentId() {
            return enrollmentId;
        }

        @Override
        public Long getStudentId() {
            return studentId;
        }

        @Override
        public String getStudentCode() {
            return studentCode;
        }

        @Override
        public String getStudentName() {
            return studentName;
        }

        @Override
        public String getEnrollmentStatus() {
            return enrollmentStatus;
        }

        @Override
        public Long getSectionId() {
            return sectionId;
        }

        @Override
        public String getSectionCode() {
            return sectionCode;
        }

        @Override
        public String getCourseCode() {
            return courseCode;
        }

        @Override
        public String getCourseName() {
            return courseName;
        }

        @Override
        public String getSemesterName() {
            return semesterName;
        }

        @Override
        public String getAcademicYear() {
            return academicYear;
        }

        @Override
        public Long getLecturerId() {
            return lecturerId;
        }

        @Override
        public BigDecimal getAttendanceScore() {
            return attendanceScore;
        }

        @Override
        public BigDecimal getExerciseScore() {
            return exerciseScore;
        }

        @Override
        public BigDecimal getPracticeScore() {
            return practiceScore;
        }

        @Override
        public BigDecimal getMidtermScore() {
            return midtermScore;
        }

        @Override
        public BigDecimal getFinalScore() {
            return finalScore;
        }

        @Override
        public BigDecimal getTotalScore() {
            return totalScore;
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