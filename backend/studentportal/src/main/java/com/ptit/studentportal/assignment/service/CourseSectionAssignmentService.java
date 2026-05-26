package com.ptit.studentportal.assignment.service;

import com.ptit.studentportal.assignment.dto.*;
import java.util.List;

public interface CourseSectionAssignmentService {
    List<CourseSectionAssignmentResponse> getAssignments(Long semesterId);
    List<LecturerOptionResponse> getLecturerOptions();
    AssignLecturerResponse assignLecturer(Long sectionId, AssignLecturerRequest request);
    AssignLecturerResponse unassignLecturer(Long sectionId);
}
