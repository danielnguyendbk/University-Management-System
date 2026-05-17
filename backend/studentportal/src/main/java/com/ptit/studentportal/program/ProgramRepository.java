package com.ptit.studentportal.program;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramRepository extends JpaRepository<Program, Long> {

	Optional<Program> findByProgramCode(String programCode);

	boolean existsByProgramCode(String programCode);

	List<Program> findByDepartmentId(Long departmentId);
}