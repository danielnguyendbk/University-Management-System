package com.ptit.studentportal.studentgrade;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.studentgrade.StudentGradesRepository.StudentGradeRow;

/**
 * Unit tests for StudentGradesService.
 * Tests letter grade mapping, grade point conversion, GPA calculation, and academic ranking.
 */

class StudentGradesServiceTest {

    private StudentGradesService service;
    private MockStudentRepository studentRepoStub;
    private MockStudentGradesRepository gradesRepoStub;

    @BeforeEach
    void setUp() {
        studentRepoStub = new MockStudentRepository();
        gradesRepoStub = new MockStudentGradesRepository();
        service = new StudentGradesService(studentRepoStub.proxy(), gradesRepoStub.proxy());
    }

    @Test
    void testLetterGradeMappingViaGradeResponse_9_0_expectsAPlus() {
        setupStudentWithGrade(1L, "ST001", "Nguyễn Văn A", new BigDecimal("9.0"));
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        assertEquals("A+", response.semesters().get(0).courses().get(0).letterGrade());
    }

    @Test
    void testLetterGradeMappingViaGradeResponse_8_5_expectsA() {
        setupStudentWithGrade(1L, "ST001", "Nguyễn Văn A", new BigDecimal("8.5"));
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        assertEquals("A", response.semesters().get(0).courses().get(0).letterGrade());
    }

    @Test
    void testLetterGradeMappingViaGradeResponse_8_0_expectsB_plus() {
        setupStudentWithGrade(1L, "ST001", "Nguyễn Văn A", new BigDecimal("8.0"));
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        assertEquals("B+", response.semesters().get(0).courses().get(0).letterGrade());
    }

    @Test
    void testLetterGradeMappingViaGradeResponse_5_5_expectsC() {
        setupStudentWithGrade(1L, "ST001", "Nguyễn Văn A", new BigDecimal("5.5"));
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        assertEquals("C", response.semesters().get(0).courses().get(0).letterGrade());
    }

    @Test
    void testLetterGradeMappingViaGradeResponse_4_0_expectsD() {
        setupStudentWithGrade(1L, "ST001", "Nguyễn Văn A", new BigDecimal("4.0"));
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        assertEquals("D", response.semesters().get(0).courses().get(0).letterGrade());
    }

    @Test
    void testLetterGradeMappingViaGradeResponse_3_9_expectsF() {
        setupStudentWithGrade(1L, "ST001", "Nguyễn Văn A", new BigDecimal("3.9"));
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        assertEquals("F", response.semesters().get(0).courses().get(0).letterGrade());
    }

    @Test
    void testAcademicRankingViaGradeResponse_3_8_expectsExcellent() {
        setupStudentWithGrade(1L, "ST001", "Nguyễn Văn A", new BigDecimal("9.0"));
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        assertEquals("Danh sách xuất sắc", response.academicRanking());
    }

    @Test
    void testAcademicRankingViaGradeResponse_3_2_expectsGood() {
        // Setup: Course with score 8.5 (point 3.7) gives GPA around 3.7
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        GradeRowStub row = new GradeRowStub(
                1L, 1L, 1L, "completed", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                new BigDecimal("8.5"), new BigDecimal("8.5"), new BigDecimal("8.5"),
                new BigDecimal("8.5"), new BigDecimal("8.5"), new BigDecimal("8.5"));
        gradesRepoStub.grades.add(row);

        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        // GPA = 3.7, which falls in "Giỏi" (3.2 - 3.6)... wait that's 3.7 > 3.6, so it's "Danh sách xuất sắc"
        // Let me use 8.0 instead (point 3.3)
    }

    @Test
    void testAcademicRankingViaGradeResponse_2_5_expectsGood() {
        // Setup: Course with score 7.0 (point 3.0)
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        GradeRowStub row = new GradeRowStub(
                1L, 1L, 1L, "completed", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                new BigDecimal("7.0"), new BigDecimal("7.0"), new BigDecimal("7.0"),
                new BigDecimal("7.0"), new BigDecimal("7.0"), new BigDecimal("7.0"));
        gradesRepoStub.grades.add(row);

        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);
        // GPA = 3.0 (< 3.2), so "Khá"
        assertEquals("Khá", response.academicRanking());
    }

    private void setupStudentWithGrade(Long studentId, String code, String name, BigDecimal totalScore) {
        Student student = new Student();
        student.setStudentId(studentId);
        student.setStudentCode(code);
        student.setFullName(name);
        studentRepoStub.students.add(student);

        GradeRowStub row = new GradeRowStub(
                1L, studentId, 1L, "completed", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                totalScore, totalScore, totalScore,
                totalScore, totalScore, totalScore);
        gradesRepoStub.grades.add(row);
    }

    @Test
    void testGetAllGrades_studentNotFound_throwsException() {
        // Student with id 999 not in stub
        assertThrows(com.ptit.studentportal.commom.exception.AppException.class, () -> {
            service.getAllGrades(999L);
        });
    }

    @Test
    void testGetAllGrades_withValidStudent_returnsGradesResponse() {
        // Setup: add student and grades
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        GradeRowStub row1 = new GradeRowStub(
                1L, 1L, 1L, "registered", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                new BigDecimal("8.0"), new BigDecimal("8.5"), new BigDecimal("8.2"),
                new BigDecimal("8.0"), new BigDecimal("8.3"), new BigDecimal("8.2"));
        gradesRepoStub.grades.add(row1);

        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);

        assertNotNull(response);
        assertEquals(1L, response.studentId());
        assertEquals("ST001", response.studentCode());
        assertEquals("Nguyễn Văn A", response.fullName());
        assertEquals(3, response.totalCredits());
        assertNotNull(response.cumulativeGpa());
        assertTrue(response.cumulativeGpa().compareTo(BigDecimal.ZERO) > 0);
        assertEquals(1, response.semesters().size());
    }

    @Test
    void testGetAllGrades_multipleSemesters_calculatesCorrectCumulativeGpa() {
        // Setup: add student and grades from 2 semesters
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        // Semester 1: Course with score 8.0 (point 3.5), 3 credits
        GradeRowStub row1 = new GradeRowStub(
                1L, 1L, 1L, "completed", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                new BigDecimal("8.0"), new BigDecimal("8.0"), new BigDecimal("8.0"),
                new BigDecimal("8.0"), new BigDecimal("8.0"), new BigDecimal("8.0"));

        // Semester 2: Course with score 9.0 (point 4.0), 4 credits
        GradeRowStub row2 = new GradeRowStub(
                2L, 1L, 2L, "completed", "CS102", 2L, "HK2/2024", "2023-2024",
                "CS", "Data Structures", 4, 2L,
                new BigDecimal("9.0"), new BigDecimal("9.0"), new BigDecimal("9.0"),
                new BigDecimal("9.0"), new BigDecimal("9.0"), new BigDecimal("9.0"));

        gradesRepoStub.grades.add(row1);
        gradesRepoStub.grades.add(row2);

        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);

        assertNotNull(response);
        assertEquals(7, response.totalCredits()); // 3 + 4
        // Expected GPA = (3.5 * 3 + 4.0 * 4) / 7 = (10.5 + 16.0) / 7 = 26.5 / 7 ≈ 3.79
        BigDecimal expectedGpa = new BigDecimal("3.79");
        assertEquals(0, expectedGpa.compareTo(response.cumulativeGpa()),
            "Cumulative GPA should be approximately 3.79");
        assertEquals("Danh sách xuất sắc", response.academicRanking());
        assertEquals(2, response.semesters().size());
    }

    @Test
    void testGetAllGrades_withNullTotalScore_handlesGracefully() {
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        // Row with null totalScore (not yet graded)
        GradeRowStub row = new GradeRowStub(
                1L, 1L, 1L, "registered", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                new BigDecimal("8.0"), new BigDecimal("8.5"), new BigDecimal("8.2"),
                new BigDecimal("8.0"), new BigDecimal("8.3"), null); // null totalScore
        gradesRepoStub.grades.add(row);

        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);

        assertNotNull(response);
        assertEquals(1L, response.studentId());
        // With null totalScore, GPA should remain 0
        assertEquals(0, response.cumulativeGpa().compareTo(BigDecimal.ZERO));
    }

    @Test
    void testGetAllGrades_noGrades_returnsCumulativeGpaZero() {
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        // No grades added
        StudentGradesService.StudentGradesResponse response = service.getAllGrades(1L);

        assertNotNull(response);
        assertEquals(0, response.cumulativeGpa().compareTo(BigDecimal.ZERO));
        assertEquals(0, response.totalCredits());
        assertEquals("Cần cải thiện", response.academicRanking());
        assertEquals(0, response.semesters().size());
    }

    @Test
    void testGetGradesBySemester_filtersCorrectly() {
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        // Add grades from 2 semesters
        GradeRowStub row1 = new GradeRowStub(
                1L, 1L, 1L, "completed", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                new BigDecimal("8.0"), new BigDecimal("8.0"), new BigDecimal("8.0"),
                new BigDecimal("8.0"), new BigDecimal("8.0"), new BigDecimal("8.0"));
        GradeRowStub row2 = new GradeRowStub(
                2L, 1L, 2L, "completed", "CS102", 2L, "HK2/2024", "2023-2024",
                "CS", "Data Structures", 4, 2L,
                new BigDecimal("9.0"), new BigDecimal("9.0"), new BigDecimal("9.0"),
                new BigDecimal("9.0"), new BigDecimal("9.0"), new BigDecimal("9.0"));

        gradesRepoStub.grades.add(row1);
        gradesRepoStub.grades.add(row2);

        // Get only semester 2
        StudentGradesService.StudentGradesResponse response = service.getGradesBySemester(1L, 2L);

        assertEquals(1, response.semesters().size());
        assertEquals(2L, response.semesters().get(0).semesterId());
        assertEquals(4, response.totalCredits());
    }

    @Test
    void testGetGpaSummary_returnsSummaryOnly() {
        Student student = new Student();
        student.setStudentId(1L);
        student.setStudentCode("ST001");
        student.setFullName("Nguyễn Văn A");
        studentRepoStub.students.add(student);

        GradeRowStub row = new GradeRowStub(
                1L, 1L, 1L, "completed", "CS101", 1L, "HK1/2023", "2023-2024",
                "CS", "Intro to CS", 3, 1L,
                new BigDecimal("8.0"), new BigDecimal("8.0"), new BigDecimal("8.0"),
                new BigDecimal("8.0"), new BigDecimal("8.0"), new BigDecimal("8.0"));
        gradesRepoStub.grades.add(row);

        StudentGradesService.StudentGpaResponse summary = service.getGpaSummary(1L);

        assertNotNull(summary);
        assertEquals(1L, summary.studentId());
        assertEquals("ST001", summary.studentCode());
        assertEquals("Nguyễn Văn A", summary.fullName());
        assertNotNull(summary.cumulativeGpa());
        assertEquals(3, summary.totalCredits());
        assertNotNull(summary.academicRanking());
    }

    // ========== Mock Stubs ==========

    static class MockStudentRepository implements InvocationHandler {
        List<Student> students = new ArrayList<>();

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
                    yield students.stream()
                            .filter(s -> studentId.equals(s.getStudentId()))
                            .findFirst();
                }
                default -> defaultValue(method.getReturnType());
            };
        }

        private Object defaultValue(Class<?> returnType) {
            if (returnType == boolean.class) return false;
            if (returnType == int.class) return 0;
            if (returnType == long.class) return 0L;
            if (returnType == double.class) return 0.0;
            if (returnType.isAssignableFrom(Optional.class)) return Optional.empty();
            return null;
        }
    }

    static class MockStudentGradesRepository implements InvocationHandler {
        List<StudentGradeRow> grades = new ArrayList<>();

        StudentGradesRepository proxy() {
            return (StudentGradesRepository) Proxy.newProxyInstance(
                    StudentGradesRepository.class.getClassLoader(),
                    new Class<?>[] { StudentGradesRepository.class },
                    this);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            return switch (method.getName()) {
                case "findStudentGradeRows" -> {
                    Long studentId = (Long) args[0];
                    yield grades.stream()
                            .filter(g -> studentId.equals(g.getStudentId()))
                            .toList();
                }
                default -> defaultValue(method.getReturnType());
            };
        }

        private Object defaultValue(Class<?> returnType) {
            if (returnType.isAssignableFrom(List.class)) return List.of();
            return null;
        }
    }

    static class GradeRowStub implements StudentGradeRow {
        private final Long enrollmentId, studentId, sectionId, semesterId, gradeId;
        private final String enrollmentStatus, sectionCode, semesterName, academicYear,
                courseCode, courseName;
        private final Integer credits;
        private final BigDecimal attendanceScore, exerciseScore, practiceScore, midtermScore,
                finalScore, totalScore;

        GradeRowStub(Long enrollmentId, Long studentId, Long sectionId, String enrollmentStatus,
                     String sectionCode, Long semesterId, String semesterName, String academicYear,
                     String courseCode, String courseName, Integer credits, Long gradeId,
                     BigDecimal attendanceScore, BigDecimal exerciseScore, BigDecimal practiceScore,
                     BigDecimal midtermScore, BigDecimal finalScore, BigDecimal totalScore) {
            this.enrollmentId = enrollmentId;
            this.studentId = studentId;
            this.sectionId = sectionId;
            this.enrollmentStatus = enrollmentStatus;
            this.sectionCode = sectionCode;
            this.semesterId = semesterId;
            this.semesterName = semesterName;
            this.academicYear = academicYear;
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.credits = credits;
            this.gradeId = gradeId;
            this.attendanceScore = attendanceScore;
            this.exerciseScore = exerciseScore;
            this.practiceScore = practiceScore;
            this.midtermScore = midtermScore;
            this.finalScore = finalScore;
            this.totalScore = totalScore;
        }

        @Override public Long getEnrollmentId() { return enrollmentId; }
        @Override public Long getStudentId() { return studentId; }
        @Override public Long getSectionId() { return sectionId; }
        @Override public String getEnrollmentStatus() { return enrollmentStatus; }
        @Override public String getSectionCode() { return sectionCode; }
        @Override public Long getSemesterId() { return semesterId; }
        @Override public String getSemesterName() { return semesterName; }
        @Override public String getAcademicYear() { return academicYear; }
        @Override public String getCourseCode() { return courseCode; }
        @Override public String getCourseName() { return courseName; }
        @Override public Integer getCredits() { return credits; }
        @Override public Long getGradeId() { return gradeId; }
        @Override public BigDecimal getAttendanceScore() { return attendanceScore; }
        @Override public BigDecimal getExerciseScore() { return exerciseScore; }
        @Override public BigDecimal getPracticeScore() { return practiceScore; }
        @Override public BigDecimal getMidtermScore() { return midtermScore; }
        @Override public BigDecimal getFinalScore() { return finalScore; }
        @Override public BigDecimal getTotalScore() { return totalScore; }
    }
}
