package com.ptit.studentportal.course;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

	Optional<Course> findByCourseCode(String courseCode);

	boolean existsByCourseCode(String courseCode);

	List<Course> findByIsActiveTrue();
}
