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
}
