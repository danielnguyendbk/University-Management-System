package com.ptit.studentportal.registration.repository;

import com.ptit.studentportal.registration.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByStudentIdAndSectionId(Long studentId, Long sectionId);

    List<Enrollment> findByStudentIdAndEnrollmentStatus(Long studentId, String status);

    List<Enrollment> findBySectionIdAndEnrollmentStatus(Long sectionId, String status);

    List<Enrollment> findBySectionId(Long sectionId);

    /** Kiểm tra student đã đăng ký course nào trong semester này chưa (để chặn trùng course) */
    @Query(value = """
            SELECT e.*
            FROM enrollments e
            JOIN course_sections cs ON cs.section_id = e.section_id
            WHERE e.student_id = :studentId
              AND cs.semester_id = :semesterId
              AND cs.course_id = :courseId
              AND e.enrollment_status = 'registered'
              AND e.section_id <> :excludeSectionId
            """, nativeQuery = true)
    List<Enrollment> findRegisteredInSameCourse(
            @Param("studentId") Long studentId,
            @Param("semesterId") Long semesterId,
            @Param("courseId") Long courseId,
            @Param("excludeSectionId") Long excludeSectionId
    );

    /** Lấy tất cả section đã registered của student trong semester để check trùng lịch */
    @Query(value = """
            SELECT e.*
            FROM enrollments e
            JOIN course_sections cs ON cs.section_id = e.section_id
            WHERE e.student_id = :studentId
              AND cs.semester_id = :semesterId
              AND e.enrollment_status = 'registered'
              AND e.section_id <> :excludeSectionId
            """, nativeQuery = true)
    List<Enrollment> findRegisteredSectionsInSemester(
            @Param("studentId") Long studentId,
            @Param("semesterId") Long semesterId,
            @Param("excludeSectionId") Long excludeSectionId
    );

    /** Lấy enrollments của student theo semester */
    @Query(value = """
            SELECT e.*
            FROM enrollments e
            JOIN course_sections cs ON cs.section_id = e.section_id
            WHERE e.student_id = :studentId
              AND cs.semester_id = :semesterId
            """, nativeQuery = true)
    List<Enrollment> findByStudentAndSemester(
            @Param("studentId") Long studentId,
            @Param("semesterId") Long semesterId
    );

    @Query(value = """
            SELECT COUNT(*)
            FROM enrollments
            WHERE section_id = :sectionId
              AND enrollment_status IN ('registered', 'completed')
            """, nativeQuery = true)
    Integer countStudentsForSection(@Param("sectionId") Long sectionId);
}
