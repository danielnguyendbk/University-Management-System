package com.ptit.studentportal.student;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

	Optional<Student> findByStudentCode(String studentCode);

	Optional<Student> findByUser_UserId(Long userId);

	boolean existsByStudentCode(String studentCode);
}
