package com.ptit.studentportal.program;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.student.Student;
import com.ptit.studentportal.student.StudentRepository;

@Service
public class ProgramCurriculumService {

    private final StudentRepository studentRepository;
    private final ProgramCurriculumRepository programCurriculumRepository;

    public ProgramCurriculumService(StudentRepository studentRepository, ProgramCurriculumRepository programCurriculumRepository) {
        this.studentRepository = studentRepository;
        this.programCurriculumRepository = programCurriculumRepository;
    }

    public ProgramCurriculumDTO getCurriculumByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + studentId));

        List<ProgramCurriculumRepository.CurriculumRow> rows = programCurriculumRepository.findCurriculumByStudentId(studentId);
        if (rows.isEmpty()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Curriculum not found for student id: " + studentId);
        }

        ProgramCurriculumRepository.CurriculumRow first = rows.getFirst();
        Map<Integer, SemesterBucket> semesters = new LinkedHashMap<>();
        int completedCredits = 0;
        int inProgressCredits = 0;
        int lockedCredits = 0;

        for (ProgramCurriculumRepository.CurriculumRow row : rows) {
            Integer semesterNumber = row.getSemesterNumber() == null ? 0 : row.getSemesterNumber();
            SemesterBucket bucket = semesters.computeIfAbsent(semesterNumber, key -> new SemesterBucket(semesterNumber));

            ProgramCurriculumCourseDTO course = new ProgramCurriculumCourseDTO(
                    row.getCourseCode(),
                    row.getCourseName(),
                    row.getCredits(),
                    row.getIsRequired(),
                    row.getCourseStatus());
            bucket.courses.add(course);

            int credits = row.getCredits() == null ? 0 : row.getCredits();
            if ("completed".equalsIgnoreCase(row.getCourseStatus())) {
                completedCredits += credits;
            } else if ("in-progress".equalsIgnoreCase(row.getCourseStatus())) {
                inProgressCredits += credits;
            } else {
                lockedCredits += credits;
            }
        }

        List<ProgramCurriculumSemesterDTO> semesterDtos = semesters.values().stream()
                .sorted(Comparator.comparing(SemesterBucket::semesterNumber))
                .map(SemesterBucket::toDto)
                .toList();

        return new ProgramCurriculumDTO(
                student.getStudentId(),
                first.getStudentCode(),
                first.getFullName(),
                first.getProgramId(),
                first.getProgramCode(),
                first.getProgramName(),
                first.getDepartmentName(),
                first.getTotalCredits(),
                completedCredits,
                inProgressCredits,
                lockedCredits,
                semesterDtos
        );
    }

    private static class SemesterBucket {
        private final Integer semesterNumber;
        private final List<ProgramCurriculumCourseDTO> courses = new java.util.ArrayList<>();

        private SemesterBucket(Integer semesterNumber) {
            this.semesterNumber = semesterNumber;
        }

        private Integer semesterNumber() {
            return semesterNumber;
        }

        private ProgramCurriculumSemesterDTO toDto() {
            int totalCredits = courses.stream().mapToInt(course -> course.credits() == null ? 0 : course.credits()).sum();
            return new ProgramCurriculumSemesterDTO(
                    semesterNumber,
                    semesterNumber == null || semesterNumber == 0 ? "Học kỳ chưa xác định" : "Học kỳ " + semesterNumber,
                    totalCredits,
                    List.copyOf(courses)
            );
        }
    }
}