package com.ptit.studentportal.grade;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GradeRepository extends JpaRepository<Grade, Long> {

    Optional<Grade> findByEnrollmentId(Long enrollmentId);

    boolean existsByEnrollmentId(Long enrollmentId);

        @Query(value = """
                        SELECT COUNT(*)
                        FROM course_sections cs
                        WHERE cs.section_id = :sectionId
                            AND cs.lecturer_id = :lecturerId
                        """, nativeQuery = true)
        long countSectionOwnedByLecturer(@Param("sectionId") Long sectionId, @Param("lecturerId") Long lecturerId);

    @Query(value = """
            SELECT
                cs.section_id AS sectionId,
                cs.course_id AS courseId,
                cs.semester_id AS semesterId,
                cs.section_code AS sectionCode,
                c.course_code AS courseCode,
                c.course_name AS courseName,
                s.semester_code AS semesterName,
                s.semester_year AS academicYear,
                cs.max_capacity AS maxCapacity,
                cs.status AS status,
                COUNT(e.enrollment_id) AS currentCapacity
            FROM course_sections cs
            JOIN courses c ON c.course_id = cs.course_id
            JOIN semesters s ON s.semester_id = cs.semester_id
            LEFT JOIN enrollments e
                ON e.section_id = cs.section_id
               AND e.enrollment_status IN ('registered', 'completed')
            WHERE cs.lecturer_id = :lecturerId
            GROUP BY
                cs.section_id, cs.course_id, cs.semester_id, cs.section_code,
                c.course_code, c.course_name, s.semester_code, s.semester_year,
                cs.max_capacity, cs.status
            ORDER BY s.start_date DESC, cs.section_code ASC
            """, nativeQuery = true)
    List<LecturerSectionView> findLecturerSections(@Param("lecturerId") Long lecturerId);

    @Query(value = """
            SELECT
                g.grade_id AS gradeId,
                e.enrollment_id AS enrollmentId,
                st.student_id AS studentId,
                st.student_code AS studentCode,
                st.full_name AS studentName,
                e.enrollment_status AS enrollmentStatus,
                cs.section_id AS sectionId,
                cs.section_code AS sectionCode,
                c.course_code AS courseCode,
                c.course_name AS courseName,
                s.semester_code AS semesterName,
                s.semester_year AS academicYear,
                cs.lecturer_id AS lecturerId,
                g.attendance_score AS attendanceScore,
                g.exercise_score AS exerciseScore,
                g.practice_score AS practiceScore,
                g.midterm_score AS midtermScore,
                g.final_score AS finalScore,
                g.total_score AS totalScore
            FROM enrollments e
            JOIN students st ON st.student_id = e.student_id
            JOIN course_sections cs ON cs.section_id = e.section_id
            JOIN courses c ON c.course_id = cs.course_id
            JOIN semesters s ON s.semester_id = cs.semester_id
            LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
            WHERE e.section_id = :sectionId
            ORDER BY st.student_code ASC
            """, nativeQuery = true)
    List<GradeDetailView> findSectionGrades(@Param("sectionId") Long sectionId);

    @Query(value = """
            SELECT
                g.grade_id AS gradeId,
                e.enrollment_id AS enrollmentId,
                st.student_id AS studentId,
                st.student_code AS studentCode,
                st.full_name AS studentName,
                e.enrollment_status AS enrollmentStatus,
                cs.section_id AS sectionId,
                cs.section_code AS sectionCode,
                c.course_code AS courseCode,
                c.course_name AS courseName,
                s.semester_code AS semesterName,
                s.semester_year AS academicYear,
                cs.lecturer_id AS lecturerId,
                g.attendance_score AS attendanceScore,
                g.exercise_score AS exerciseScore,
                g.practice_score AS practiceScore,
                g.midterm_score AS midtermScore,
                g.final_score AS finalScore,
                g.total_score AS totalScore
            FROM enrollments e
            JOIN students st ON st.student_id = e.student_id
            JOIN course_sections cs ON cs.section_id = e.section_id
            JOIN courses c ON c.course_id = cs.course_id
            JOIN semesters s ON s.semester_id = cs.semester_id
            LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
            WHERE e.enrollment_id = :enrollmentId
            LIMIT 1
            """, nativeQuery = true)
    Optional<GradeDetailView> findGradeDetailByEnrollmentId(@Param("enrollmentId") Long enrollmentId);

    interface LecturerSectionView {
        Long getSectionId();
        Long getCourseId();
        Long getSemesterId();
        String getSectionCode();
        String getCourseCode();
        String getCourseName();
        String getSemesterName();
        String getAcademicYear();
        Integer getMaxCapacity();
        String getStatus();
        BigInteger getCurrentCapacity();
    }

    interface GradeDetailView {
        Long getGradeId();
        Long getEnrollmentId();
        Long getStudentId();
        String getStudentCode();
        String getStudentName();
        String getEnrollmentStatus();
        Long getSectionId();
        String getSectionCode();
        String getCourseCode();
        String getCourseName();
        String getSemesterName();
        String getAcademicYear();
        Long getLecturerId();
        BigDecimal getAttendanceScore();
        BigDecimal getExerciseScore();
        BigDecimal getPracticeScore();
        BigDecimal getMidtermScore();
        BigDecimal getFinalScore();
        BigDecimal getTotalScore();
    }
}
