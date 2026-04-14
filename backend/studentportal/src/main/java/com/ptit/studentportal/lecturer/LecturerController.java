package com.ptit.studentportal.lecturer;

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
@RequestMapping("/api/lecturer")
public class LecturerController {

    private final LecturerService lecturerService;

    public LecturerController(LecturerService lecturerService) {
        this.lecturerService = lecturerService;
    }

    @GetMapping
    public List<LecturerDTO> getAllLecturers() {
        return lecturerService.getAllLecturers();
    }

    @GetMapping("/{lecturerId}")
    public LecturerDTO getLecturerById(@PathVariable Long lecturerId) {
        return lecturerService.getLecturerById(lecturerId);
    }

    @GetMapping("/code/{lecturerCode}")
    public LecturerDTO getLecturerByCode(@PathVariable String lecturerCode) {
        return lecturerService.getLecturerByCode(lecturerCode);
    }

    @PostMapping
    public ResponseEntity<LecturerDTO> createLecturer(@Valid @RequestBody LecturerCreateRequest request) {
        LecturerDTO created = lecturerService.createLecturer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}