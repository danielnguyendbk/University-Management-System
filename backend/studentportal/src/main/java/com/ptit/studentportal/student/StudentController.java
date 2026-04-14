package com.ptit.studentportal.student;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

	private final StudentService studentService;

	public StudentController(StudentService studentService) {
		this.studentService = studentService;
	}

	@GetMapping
	public List<StudentDTO> getAllStudents() {
		return studentService.getAllStudents();
	}

	@GetMapping("/{studentId}")
	public StudentDTO getStudentById(@PathVariable Long studentId) {
		return studentService.getStudentById(studentId);
	}

	@GetMapping("/code/{studentCode}")
	public StudentDTO getStudentByCode(@PathVariable String studentCode) {
		return studentService.getStudentByCode(studentCode);
	}

	@PostMapping
	public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentCreateRequest request) {
		StudentDTO created = studentService.createStudent(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}
}
