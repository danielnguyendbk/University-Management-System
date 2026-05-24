package com.ptit.studentportal.student;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {

	Optional<Student> findByStudentCode(String studentCode);

	Optional<Student> findByUser_UserId(Long userId);

	boolean existsByStudentCode(String studentCode);

	@Query(value = """
			SELECT cs.course_id AS courseId, MAX(g.total_score) AS bestTotalScore
			FROM enrollments e
			JOIN course_sections cs ON cs.section_id = e.section_id
			JOIN grades g ON g.enrollment_id = e.enrollment_id
			WHERE e.student_id = :studentId
			  AND e.enrollment_status IN ('registered', 'completed')
			  AND g.final_score IS NOT NULL
			GROUP BY cs.course_id
			""", nativeQuery = true)
	List<StudentCourseScoreProjection> findBestCourseScoresByStudentId(@Param("studentId") Long studentId);

	interface StudentCourseScoreProjection {
		Long getCourseId();

		BigDecimal getBestTotalScore();
	}
}
