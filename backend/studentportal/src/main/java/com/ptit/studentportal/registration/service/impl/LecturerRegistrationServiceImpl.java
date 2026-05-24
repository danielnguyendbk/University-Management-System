package com.ptit.studentportal.registration.service.impl;

import com.ptit.studentportal.commom.exception.BusinessException;
import com.ptit.studentportal.registration.dto.response.LecturerSectionResponse;
import com.ptit.studentportal.registration.dto.response.SectionStudentResponse;
import com.ptit.studentportal.registration.entity.Enrollment;
import com.ptit.studentportal.registration.repository.EnrollmentRepository;
import com.ptit.studentportal.registration.repository.RegCourseSectionRepository;
import com.ptit.studentportal.registration.service.LecturerRegistrationService;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LecturerRegistrationServiceImpl implements LecturerRegistrationService {

    private final RegCourseSectionRepository sectionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    @Override
    public List<LecturerSectionResponse> getLecturerSections(Long lecturerId, Long semesterId) {
        List<CourseSection> sections = sectionRepository.findByLecturerIdAndSemesterId(lecturerId, semesterId);
        
        return sections.stream().map(s -> {
            var course = courseRepository.findById(s.getCourseId()).orElse(null);
            int current = (int) enrollmentRepository.findBySectionIdAndEnrollmentStatus(s.getSectionId(), "registered").size();
            return new LecturerSectionResponse(
                    s.getSectionId(),
                    s.getSectionCode(),
                    course != null ? course.getCourseCode() : "",
                    course != null ? course.getCourseName() : "",
                    course != null ? course.getCredits() : 0,
                    s.getMaxCapacity(),
                    current,
                    s.getMaxCapacity() - current,
                    s.getStatus()
            );
        }).collect(Collectors.toList());
    }

    @Override
    public List<SectionStudentResponse> getLecturerSectionStudents(Long lecturerId, Long sectionId) {
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lớp học phần"));

        if (!section.getLecturerId().equals(lecturerId)) {
            throw new BusinessException("Bạn không có quyền xem danh sách sinh viên của lớp này");
        }

        List<Enrollment> enrollments = enrollmentRepository.findBySectionId(sectionId);
        
        return enrollments.stream().map(e -> {
            var student = studentRepository.findById(e.getStudentId()).orElse(null);
            return new SectionStudentResponse(
                    e.getEnrollmentId(),
                    e.getStudentId(),
                    student != null ? student.getStudentCode() : "",
                    student != null ? student.getFullName() : "",
                    student != null && student.getUser() != null ? student.getUser().getEmail() : "",
                    e.getEnrollmentStatus(),
                    e.getRegisteredAt(),
                    e.getDroppedAt()
            );
        }).collect(Collectors.toList());
    }
}
