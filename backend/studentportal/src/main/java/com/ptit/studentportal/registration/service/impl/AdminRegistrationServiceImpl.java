package com.ptit.studentportal.registration.service.impl;

import com.ptit.studentportal.commom.exception.BusinessException;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.registration.dto.request.*;
import com.ptit.studentportal.registration.dto.response.*;
import com.ptit.studentportal.registration.enums.RegistrationStatus;
import com.ptit.studentportal.registration.repository.*;
import com.ptit.studentportal.registration.service.AdminRegistrationService;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminRegistrationServiceImpl implements AdminRegistrationService {

    private final RegSemesterRepository semesterRepository;
    private final RegCourseSectionRepository sectionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    // Tạm thời chưa inject notification repositories

    @Override
    public List<RegistrationSemesterResponse> getRegistrationSemesters() {
        return semesterRepository.findAllByOrderBySemesterIdDesc().stream()
                .map(s -> new RegistrationSemesterResponse(
                        s.getSemesterId(),
                        s.getSemesterCode(),
                        s.getSemesterName(),
                        s.getAcademicYear(),
                        s.getRegistrationOpen(),
                        s.getRegistrationClose(),
                        s.getRegistrationStatus() != null ? s.getRegistrationStatus().name() : "CLOSED",
                        s.getStatus() != null ? s.getStatus().name() : null
                ))
                .collect(Collectors.toList());
    }

    @Override
    public void openRegistration(Long semesterId, OpenRegistrationRequest request) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy học kỳ"));
        
        semester.setRegistrationOpen(request.registrationOpen());
        semester.setRegistrationClose(request.registrationClose());
        semester.setRegistrationStatus(RegistrationStatus.OPEN);
        semesterRepository.save(semester);

        if (request.sendNotification()) {
            // TODO: Gửi thông báo cho toàn bộ sinh viên/giảng viên
        }
    }

    @Override
    public void closeRegistration(Long semesterId) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy học kỳ"));
        semester.setRegistrationStatus(RegistrationStatus.CLOSED);
        semesterRepository.save(semester);
    }

    @Override
    public void lockRegistration(Long semesterId) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy học kỳ"));
        semester.setRegistrationStatus(RegistrationStatus.LOCKED);
        semesterRepository.save(semester);
    }

    @Override
    public List<AdminSectionResponse> getAdminSections(Long semesterId) {
        // Query native để lấy kèm capacity từ view vw_section_capacity
        // Trong thực tế có thể dùng JdbcTemplate hoặc mapping complex
        // Ở đây tôi sẽ map đơn giản, nếu cần performance cao hơn sẽ dùng query chuyên dụng
        List<CourseSection> sections = sectionRepository.findAllBySemesterIdOrderByCode(semesterId);
        
        return sections.stream().map(s -> {
            // Mock capacity data hoặc query từng cái (không khuyến khích query từng cái trong loop, nhưng ở đây demo mapping)
            // Tốt nhất là viết 1 query join ở Repository trả về DTO
            return mapToAdminSectionResponse(s);
        }).collect(Collectors.toList());
    }

    @Override
    public AdminSectionResponse createSection(CreateCourseSectionRequest request) {
        if (sectionRepository.findBySemesterIdAndSectionCode(request.semesterId(), request.sectionCode()).isPresent()) {
            throw new BusinessException("Mã lớp học phần đã tồn tại trong học kỳ này");
        }

        CourseSection section = CourseSection.builder()
                .semesterId(request.semesterId())
                .courseId(request.courseId())
                .lecturerId(request.lecturerId())
                .sectionCode(request.sectionCode())
                .maxCapacity(request.maxCapacity())
                .status(request.status())
                .build();
        
        return mapToAdminSectionResponse(sectionRepository.save(section));
    }

    @Override
    public AdminSectionResponse updateSection(Long sectionId, UpdateCourseSectionRequest request) {
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lớp học phần"));

        // Check if new maxCapacity is smaller than current registered students
        // List<Enrollment> registered = enrollmentRepository.findBySectionIdAndEnrollmentStatus(sectionId, "registered");
        // if (request.maxCapacity() < registered.size()) {
        //     throw new BusinessException("Sức chứa không được nhỏ hơn số sinh viên đã đăng ký (" + registered.size() + ")");
        // }

        section.setLecturerId(request.lecturerId());
        section.setSectionCode(request.sectionCode());
        section.setMaxCapacity(request.maxCapacity());
        section.setStatus(request.status());
        
        return mapToAdminSectionResponse(sectionRepository.save(section));
    }

    @Override
    public void openSection(Long sectionId) {
        updateSectionStatus(sectionId, "open");
    }

    @Override
    public void closeSection(Long sectionId) {
        updateSectionStatus(sectionId, "closed");
    }

    @Override
    public void cancelSection(Long sectionId) {
        updateSectionStatus(sectionId, "cancelled");
    }

    private void updateSectionStatus(Long sectionId, String status) {
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lớp học phần"));
        section.setStatus(status);
        sectionRepository.save(section);
    }

    @Override
    public List<SectionStudentResponse> getSectionStudents(Long sectionId) {
        // Join with Student info
        // implementation for listing students
        return List.of(); 
    }

    @Override
    public void sendRegistrationNotification(Long semesterId, SendRegistrationNotificationRequest request) {
        // logic to send notifications
    }

    private AdminSectionResponse mapToAdminSectionResponse(CourseSection s) {
        // Cần fetch course/lecturer name. Trong production nên dùng DTO Projection để join 1 lần.
        var course = courseRepository.findById(s.getCourseId()).orElse(null);
        var lecturer = lecturerRepository.findById(s.getLecturerId()).orElse(null);
        
        return new AdminSectionResponse(
                s.getSectionId(),
                s.getSectionCode(),
                s.getCourseId(),
                course != null ? course.getCourseCode() : "",
                course != null ? course.getCourseName() : "",
                course != null ? course.getCredits() : 0,
                s.getSemesterId(),
                s.getLecturerId(),
                lecturer != null ? lecturer.getLecturerCode() : "",
                lecturer != null ? lecturer.getFullName() : "",
                s.getMaxCapacity(),
                0, // TODO: current capacity
                s.getMaxCapacity(), // TODO: remaining capacity
                s.getStatus()
        );
    }
}
