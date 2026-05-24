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
                cs.class_id AS classId,
                sc.class_code AS classCode,
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
            JOIN courses c ON cs.course_id = c.course_id
            JOIN program_courses pc ON c.course_id = pc.course_id
            LEFT JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
            LEFT JOIN student_classes sc ON cs.class_id = sc.class_id
            LEFT JOIN vw_section_capacity vsc ON cs.section_id = vsc.section_id
            WHERE pc.program_id = :programId
              AND cs.semester_id = :semesterId
              AND LOWER(cs.status) = 'open'
              AND c.is_active = 1
            ORDER BY cs.section_code ASC
            """, nativeQuery = true)
    List<com.ptit.studentportal.registration.dto.response.AvailableSectionProjection> findAvailableSectionsForProgram(
            @Param("programId") Long programId,
            @Param("semesterId") Long semesterId
    );

    @Query(value = "SELECT class_code FROM student_classes WHERE class_id = :classId", nativeQuery = true)
    String findClassCodeById(@Param("classId") Long classId);
}
