package com.ptit.studentportal.lecturer;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;

@RestController
@RequestMapping("/api/lecturer/course-sections")
public class LecturerCourseSectionController {

    private final LecturerCourseSectionService lecturerCourseSectionService;

    public LecturerCourseSectionController(LecturerCourseSectionService lecturerCourseSectionService) {
        this.lecturerCourseSectionService = lecturerCourseSectionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LecturerCourseSectionResponse>>> getMyCourseSections(
            @RequestParam(required = false) Long semesterId,
            Authentication authentication
    ) {
        String username = authentication.getName();

        List<LecturerCourseSectionResponse> response =
                lecturerCourseSectionService.getMyCourseSections(username, semesterId);

        return ResponseEntity.ok(ApiResponse.success("Lecturer course sections loaded", response));
    }
}
