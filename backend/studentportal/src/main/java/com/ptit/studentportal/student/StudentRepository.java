package com.ptit.studentportal.student;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {

	Optional<Student> findByStudentCode(String studentCode);

	Optional<Student> findByUser_UserId(Long userId);

	boolean existsByStudentCode(String studentCode);
}
