package com.ptit.studentportal.registration.repository;

import com.ptit.studentportal.timetable.entity.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegCourseSectionRepository extends JpaRepository<CourseSection, Long> {

    List<CourseSection> findBySemesterId(Long semesterId);

    Optional<CourseSection> findBySemesterIdAndSectionCode(Long semesterId, String sectionCode);

    @Query(value = """
            SELECT cs.*
            FROM course_sections cs
            WHERE cs.semester_id = :semesterId
              AND cs.status IN ('open', 'draft', 'closed', 'cancelled')
            ORDER BY cs.section_code ASC
            """, nativeQuery = true)
    List<CourseSection> findAllBySemesterIdOrderByCode(@Param("semesterId") Long semesterId);

    /** Lấy lớp học phần của giảng viên */
    List<CourseSection> findByLecturerIdAndSemesterId(Long lecturerId, Long semesterId);

    @Query(value = """
            SELECT 
                cs.section_id AS sectionId,
                cs.section_code AS sectionCode,
                NULL AS classId,
                NULL AS classCode,
                c.course_id AS courseId,
                c.course_code AS courseCode,
                c.course_name AS courseName,
                c.credits AS credits,
                l.full_name AS lecturerName,
                cs.max_capacity AS maxCapacity,
                COALESCE(vsc.current_capacity, 0) AS currentCapacity,
                COALESCE(vsc.remaining_capacity, cs.max_capacity) AS remainingCapacity,
                cs.status AS status
            FROM course_sections cs
            JOIN program_courses pc ON pc.course_id = cs.course_id
            JOIN semesters sem ON sem.semester_id = cs.semester_id
            JOIN courses c ON c.course_id = cs.course_id
            LEFT JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
            LEFT JOIN vw_section_capacity vsc ON cs.section_id = vsc.section_id
            WHERE pc.program_id = :programId
              AND cs.semester_id = :semesterId
              AND pc.recommended_semester = :curriculumSemester
              AND LOWER(cs.status) = 'open'
              AND NOW() BETWEEN sem.registration_open AND sem.registration_close
              AND c.is_active = 1
            ORDER BY cs.section_code ASC
            """, nativeQuery = true)
    List<com.ptit.studentportal.registration.dto.response.AvailableSectionProjection> findAvailableSectionsForProgramSemester(
            @Param("programId") Long programId,
            @Param("semesterId") Long semesterId,
            @Param("curriculumSemester") Integer curriculumSemester
    );

    @Query(value = """
            SELECT COUNT(*)
            FROM course_sections cs
            JOIN program_courses pc ON pc.course_id = cs.course_id
            WHERE pc.program_id = :programId
              AND cs.section_id = :sectionId
              AND pc.recommended_semester = :curriculumSemester
            """, nativeQuery = true)
    long countSectionInProgramCurriculumSemester(
            @Param("programId") Long programId,
            @Param("sectionId") Long sectionId,
            @Param("curriculumSemester") Integer curriculumSemester
    );

    default String findClassCodeById(Long classId) {
        return null;
    }
}
