package com.ptit.studentportal.studentgrade;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.studentgrade.StudentGradesRepository.StudentGradeRow;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;

@Service
@Transactional(readOnly = true)
public class StudentGradesService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final StudentRepository studentRepository;
    private final StudentGradesRepository studentGradesRepository;

    public StudentGradesService(StudentRepository studentRepository, StudentGradesRepository studentGradesRepository) {
        this.studentRepository = studentRepository;
        this.studentGradesRepository = studentGradesRepository;
    }

    public StudentGradesResponse getAllGrades(Long studentId) {
        Student student = getStudent(studentId);
        return buildGradesResponse(student, null);
    }

    public StudentGradesResponse getGradesBySemester(Long studentId, Long semesterId) {
        Student student = getStudent(studentId);
        return buildGradesResponse(student, semesterId);
    }

    public StudentGpaResponse getGpaSummary(Long studentId) {
        StudentGradesResponse response = getAllGrades(studentId);
        return new StudentGpaResponse(
                response.studentId(),
                response.studentCode(),
                response.fullName(),
                response.cumulativeGpa(),
                response.totalCredits(),
                response.academicRanking()
        );
    }

    private Student getStudent(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + studentId));
    }

    private StudentGradesResponse buildGradesResponse(Student student, Long semesterId) {
        List<StudentGradeRow> rows = studentGradesRepository.findStudentGradeRows(student.getStudentId());

        if (semesterId != null) {
            rows = rows.stream()
                    .filter(row -> semesterId.equals(row.getSemesterId()))
                    .toList();
        }

        Map<Long, SemesterGradesResponse.Builder> semesterMap = new LinkedHashMap<>();
        BigDecimal cumulativePoints = ZERO;
        int cumulativeCredits = 0;

        for (StudentGradeRow row : rows) {
            BigDecimal totalScore = row.getTotalScore() == null ? ZERO : row.getTotalScore();
            String letterGrade = toLetterGrade(totalScore);
            BigDecimal points = toGradePoint(totalScore);
            int credits = row.getCredits() == null ? 0 : row.getCredits();

            semesterMap.computeIfAbsent(row.getSemesterId(), id -> new SemesterGradesResponse.Builder(
                    row.getSemesterId(),
                    row.getSemesterName(),
                    row.getAcademicYear()))
                    .addCourse(new StudentCourseGradeResponse(
                            row.getEnrollmentId(),
                            row.getSectionId(),
                            row.getSectionCode(),
                            row.getCourseCode(),
                            row.getCourseName(),
                            credits,
                            row.getAttendanceScore(),
                            row.getExerciseScore(),
                            row.getPracticeScore(),
                            row.getMidtermScore(),
                            row.getFinalScore(),
                            totalScore,
                            letterGrade,
                            points));

            if (credits > 0) {
                cumulativePoints = cumulativePoints.add(points.multiply(BigDecimal.valueOf(credits)));
                cumulativeCredits += credits;
            }
        }

        List<SemesterGradesResponse> semesters = semesterMap.values().stream()
                .map(SemesterGradesResponse.Builder::build)
                .sorted(Comparator.comparing(SemesterGradesResponse::semesterId).reversed())
                .toList();

        BigDecimal cumulativeGpa = cumulativeCredits == 0
                ? ZERO
                : cumulativePoints.divide(BigDecimal.valueOf(cumulativeCredits), 2, RoundingMode.HALF_UP);

        return new StudentGradesResponse(
                student.getStudentId(),
                student.getStudentCode(),
                student.getFullName(),
                cumulativeGpa,
                cumulativeCredits,
                academicRanking(cumulativeGpa),
                semesters
        );
    }

    private String academicRanking(BigDecimal cumulativeGpa) {
        if (cumulativeGpa.compareTo(new BigDecimal("3.6")) >= 0) {
            return "Danh sách xuất sắc";
        }
        if (cumulativeGpa.compareTo(new BigDecimal("3.2")) >= 0) {
            return "Giỏi";
        }
        if (cumulativeGpa.compareTo(new BigDecimal("2.5")) >= 0) {
            return "Khá";
        }
        if (cumulativeGpa.compareTo(new BigDecimal("2.0")) >= 0) {
            return "Trung bình";
        }
        return "Cần cải thiện";
    }

    private String toLetterGrade(BigDecimal totalScore) {
        if (totalScore.compareTo(new BigDecimal("8.95")) >= 0) return "A+";
        if (totalScore.compareTo(new BigDecimal("8.45")) >= 0) return "A";
        if (totalScore.compareTo(new BigDecimal("7.95")) >= 0) return "B+";
        if (totalScore.compareTo(new BigDecimal("6.95")) >= 0) return "B";
        if (totalScore.compareTo(new BigDecimal("6.45")) >= 0) return "C+";
        if (totalScore.compareTo(new BigDecimal("5.45")) >= 0) return "C";
        if (totalScore.compareTo(new BigDecimal("4.95")) >= 0) return "D+";
        if (totalScore.compareTo(new BigDecimal("3.95")) >= 0) return "D";
        return "F";
    }

    private BigDecimal toGradePoint(BigDecimal totalScore) {
        if (totalScore.compareTo(new BigDecimal("8.95")) >= 0) return new BigDecimal("4.0");
        if (totalScore.compareTo(new BigDecimal("8.45")) >= 0) return new BigDecimal("3.7");
        if (totalScore.compareTo(new BigDecimal("7.95")) >= 0) return new BigDecimal("3.5");
        if (totalScore.compareTo(new BigDecimal("6.95")) >= 0) return new BigDecimal("3.0");
        if (totalScore.compareTo(new BigDecimal("6.45")) >= 0) return new BigDecimal("2.5");
        if (totalScore.compareTo(new BigDecimal("5.45")) >= 0) return new BigDecimal("2.0");
        if (totalScore.compareTo(new BigDecimal("4.95")) >= 0) return new BigDecimal("1.5");
        if (totalScore.compareTo(new BigDecimal("3.95")) >= 0) return new BigDecimal("1.0");
        return ZERO;
    }

    public record StudentGradesResponse(
            Long studentId,
            String studentCode,
            String fullName,
            BigDecimal cumulativeGpa,
            Integer totalCredits,
            String academicRanking,
            List<SemesterGradesResponse> semesters
    ) {
    }

    public record StudentGpaResponse(
            Long studentId,
            String studentCode,
            String fullName,
            BigDecimal cumulativeGpa,
            Integer totalCredits,
            String academicRanking
    ) {
    }

    public record SemesterGradesResponse(
            Long semesterId,
            String semesterName,
            String academicYear,
            BigDecimal semesterGpa,
            Integer totalCredits,
            List<StudentCourseGradeResponse> courses
    ) {
        public static class Builder {
            private final Long semesterId;
            private final String semesterName;
            private final String academicYear;
            private final List<StudentCourseGradeResponse> courses = new ArrayList<>();

            public Builder(Long semesterId, String semesterName, String academicYear) {
                this.semesterId = semesterId;
                this.semesterName = semesterName;
                this.academicYear = academicYear;
            }

            public Builder addCourse(StudentCourseGradeResponse course) {
                courses.add(course);
                return this;
            }

            public SemesterGradesResponse build() {
                int totalCredits = courses.stream().mapToInt(StudentCourseGradeResponse::credits).sum();
                BigDecimal weightedPoints = courses.stream()
                        .map(course -> course.points().multiply(BigDecimal.valueOf(course.credits())))
                        .reduce(ZERO, BigDecimal::add);
                BigDecimal semesterGpa = totalCredits == 0
                        ? ZERO
                        : weightedPoints.divide(BigDecimal.valueOf(totalCredits), 2, RoundingMode.HALF_UP);
                return new SemesterGradesResponse(semesterId, semesterName, academicYear, semesterGpa, totalCredits, List.copyOf(courses));
            }
        }
    }

    public record StudentCourseGradeResponse(
            Long enrollmentId,
            Long sectionId,
            String sectionCode,
            String courseCode,
            String courseName,
            Integer credits,
            BigDecimal attendanceScore,
            BigDecimal exerciseScore,
            BigDecimal practiceScore,
            BigDecimal midtermScore,
            BigDecimal finalScore,
            BigDecimal totalScore,
            String letterGrade,
            BigDecimal points
    ) {
    }
}