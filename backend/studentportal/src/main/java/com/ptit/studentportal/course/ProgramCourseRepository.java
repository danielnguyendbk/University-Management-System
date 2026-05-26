package com.ptit.studentportal.course;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProgramCourseRepository extends JpaRepository<ProgramCourse, Long> {

	List<ProgramCourse> findByProgramIdOrderByRecommendedSemesterAsc(Long programId);

	boolean existsByProgramIdAndCourseId(Long programId, Long courseId);

	Optional<ProgramCourse> findByProgramIdAndCourseId(Long programId, Long courseId);

	boolean existsByCourseId(Long courseId);

	void deleteByCourseId(Long courseId);

	@Query("SELECT pc.courseId FROM ProgramCourse pc WHERE pc.programId = :programId")
	List<Long> findCourseIdsByProgramId(@Param("programId") Long programId);
}
