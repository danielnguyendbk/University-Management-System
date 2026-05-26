package com.ptit.studentportal.program;


import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.ptit.studentportal.student.Student;

public interface ProgramCurriculumRepository extends JpaRepository<Student, Long> {

    @Query(value = """
            SELECT
                st.student_id AS studentId,
                st.student_code AS studentCode,
                st.full_name AS fullName,
                p.program_id AS programId,
                p.program_code AS programCode,
                p.program_name AS programName,
                d.department_name AS departmentName,
                p.total_credits AS totalCredits,
                pc.recommended_semester AS semesterNumber,
                pc.is_required AS isRequired,
                c.course_code AS courseCode,
                c.course_name AS courseName,
                c.credits AS credits,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM enrollments e
                        JOIN course_sections cs ON cs.section_id = e.section_id
                        WHERE e.student_id = st.student_id
                          AND cs.course_id = c.course_id
                          AND e.enrollment_status = 'completed'
                    ) THEN 'completed'
                    WHEN EXISTS (
                        SELECT 1
                        FROM enrollments e
                        JOIN course_sections cs ON cs.section_id = e.section_id
                        WHERE e.student_id = st.student_id
                          AND cs.course_id = c.course_id
                          AND e.enrollment_status = 'registered'
                    ) THEN 'in-progress'
                    ELSE 'locked'
                END AS courseStatus
            FROM students st
            JOIN programs p ON p.program_id = st.program_id
            JOIN departments d ON d.department_id = p.department_id
            JOIN program_courses pc ON pc.program_id = p.program_id
            JOIN courses c ON c.course_id = pc.course_id
            WHERE st.student_id = :studentId
            ORDER BY COALESCE(pc.recommended_semester, 9999), c.course_code ASC
            """, nativeQuery = true)
    List<CurriculumRow> findCurriculumByStudentId(@Param("studentId") Long studentId);

    interface CurriculumRow {
        Long getStudentId();
        String getStudentCode();
        String getFullName();
        Long getProgramId();
        String getProgramCode();
        String getProgramName();
        String getDepartmentName();
        Integer getTotalCredits();
        Integer getSemesterNumber();
        Boolean getIsRequired();
        String getCourseCode();
        String getCourseName();
        Integer getCredits();
        String getCourseStatus();
    }
}