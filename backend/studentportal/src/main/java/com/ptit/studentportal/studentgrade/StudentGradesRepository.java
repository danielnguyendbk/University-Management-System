package com.ptit.studentportal.studentgrade;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.grade.Grade;

public interface StudentGradesRepository extends JpaRepository<Grade, Long> {

    @Query(value = """
            SELECT
                e.enrollment_id AS enrollmentId,
                e.student_id AS studentId,
                e.section_id AS sectionId,
                e.enrollment_status AS enrollmentStatus,
                cs.section_code AS sectionCode,
                cs.semester_id AS semesterId,
                s.semester_name AS semesterName,
                s.academic_year AS academicYear,
                c.course_code AS courseCode,
                c.course_name AS courseName,
                c.credits AS credits,
                g.grade_id AS gradeId,
                g.attendance_score AS attendanceScore,
                g.exercise_score AS exerciseScore,
                g.practice_score AS practiceScore,
                g.midterm_score AS midtermScore,
                g.final_score AS finalScore,
                g.total_score AS totalScore
            FROM enrollments e
            JOIN course_sections cs ON cs.section_id = e.section_id
            JOIN semesters s ON s.semester_id = cs.semester_id
            JOIN courses c ON c.course_id = cs.course_id
            LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
            WHERE e.student_id = :studentId
              AND e.enrollment_status IN ('registered', 'completed')
            ORDER BY s.start_date DESC, cs.section_code ASC
            """, nativeQuery = true)
    List<StudentGradeRow> findStudentGradeRows(@Param("studentId") Long studentId);

    interface StudentGradeRow {
        Long getEnrollmentId();
        Long getStudentId();
        Long getSectionId();
        String getEnrollmentStatus();
        String getSectionCode();
        Long getSemesterId();
        String getSemesterName();
        String getAcademicYear();
        String getCourseCode();
        String getCourseName();
        Integer getCredits();
        Long getGradeId();
        BigDecimal getAttendanceScore();
        BigDecimal getExerciseScore();
        BigDecimal getPracticeScore();
        BigDecimal getMidtermScore();
        BigDecimal getFinalScore();
        BigDecimal getTotalScore();
    }
}