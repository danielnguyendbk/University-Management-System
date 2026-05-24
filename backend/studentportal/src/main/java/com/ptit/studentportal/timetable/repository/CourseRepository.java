package com.ptit.studentportal.timetable.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ptit.studentportal.timetable.entity.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query(value = "SELECT COUNT(*) FROM program_courses WHERE program_id = :programId AND course_id = :courseId", nativeQuery = true)
    long countByProgramIdAndCourseId(@Param("programId") Long programId, @Param("courseId") Long courseId);
}

