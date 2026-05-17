package com.ptit.studentportal.admin.common;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.department.DepartmentRepository;
import com.ptit.studentportal.program.ProgramRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminLookupController {

	private final DepartmentRepository departmentRepository;
	private final ProgramRepository programRepository;

	public AdminLookupController(DepartmentRepository departmentRepository, ProgramRepository programRepository) {
		this.departmentRepository = departmentRepository;
		this.programRepository = programRepository;
	}

	@GetMapping("/departments")
	public List<DepartmentOption> departments() {
		return departmentRepository.findAll().stream()
				.map(item -> new DepartmentOption(item.getDepartmentId(), item.getDepartmentCode(), item.getDepartmentName()))
				.toList();
	}

	@GetMapping("/programs")
	public List<ProgramOption> programs(@RequestParam(required = false) Long departmentId) {
			return (departmentId == null ? programRepository.findAll() : programRepository.findByDepartmentId(departmentId)).stream()
				.map(item -> new ProgramOption(item.getProgramId(), item.getDepartmentId(), item.getProgramCode(), item.getProgramName(), item.getStatus(), item.getCreatedAt()))
				.toList();
	}
}