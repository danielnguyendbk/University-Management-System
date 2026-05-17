package com.ptit.studentportal.department;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

	Optional<Department> findByDepartmentCode(String departmentCode);

	boolean existsByDepartmentCode(String departmentCode);
}