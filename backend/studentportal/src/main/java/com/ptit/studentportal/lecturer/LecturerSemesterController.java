package com.ptit.studentportal.lecturer;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.timetable.dto.response.SemesterOptionResponse;
import com.ptit.studentportal.timetable.repository.SemesterRepository;

@RestController
@RequestMapping("/api/lecturer/semesters")
public class LecturerSemesterController {

    private final SemesterRepository semesterRepository;

    public LecturerSemesterController(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SemesterOptionResponse>>> getSemesters() {
        List<SemesterOptionResponse> response = semesterRepository.findAll().stream()
                .sorted((a, b) -> b.getSemesterId().compareTo(a.getSemesterId())) // Latest first
                .map(s -> new SemesterOptionResponse(
                        s.getSemesterId(),
                        s.getSemesterCode(),
                        s.getSemesterName(),
                        (s.getAcademicYear() != null && !s.getAcademicYear().trim().isEmpty())
                                ? s.getAcademicYear()
                                : s.getSemesterYear(),
                        s.getStatus() != null ? s.getStatus().name().toLowerCase() : null,
                        s.getTimetableStatus() != null ? s.getTimetableStatus().name().toLowerCase() : null,
                        s.getPricePerCredit()
                ))
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Semesters loaded", response));
    }
}
