package com.ptit.studentportal.assignment.service.impl;

import com.ptit.studentportal.assignment.dto.*;
import com.ptit.studentportal.assignment.service.CourseSectionAssignmentService;
import com.ptit.studentportal.commom.exception.BusinessException;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.timetable.entity.ClassSession;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.enums.SessionStatus;
import com.ptit.studentportal.timetable.repository.ClassSessionRepository;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseSectionAssignmentServiceImpl implements CourseSectionAssignmentService {

    private final CourseSectionRepository courseSectionRepository;
    private final LecturerRepository lecturerRepository;
    private final ClassSessionRepository classSessionRepository;

    private boolean convertToBoolean(Object val) {
        if (val == null) return false;
        if (val instanceof Boolean) return (Boolean) val;
        if (val instanceof Number) return ((Number) val).intValue() > 0;
        if (val instanceof String) return "1".equals(val) || "true".equalsIgnoreCase((String) val);
        return false;
    }

    @Override
    public List<CourseSectionAssignmentResponse> getAssignments(Long semesterId) {
        List<CourseSectionAssignmentProjection> projections = courseSectionRepository.findAssignmentsBySemesterId(semesterId);
        return projections.stream().map(p -> new CourseSectionAssignmentResponse(
                p.getSectionId(),
                p.getSectionCode(),
                p.getCourseId(),
                p.getCourseCode(),
                p.getCourseName(),
                p.getClassId(),
                p.getClassCode(),
                p.getLecturerId(),
                p.getLecturerCode(),
                p.getLecturerName(),
                p.getMaxCapacity(),
                p.getStatus(),
                convertToBoolean(p.getHasSchedule()),
                convertToBoolean(p.getHasGeneratedSessions()),
                p.getLecturerId() != null ? "ASSIGNED" : "UNASSIGNED"
        )).collect(Collectors.toList());
    }

    @Override
    public List<LecturerOptionResponse> getLecturerOptions() {
        List<LecturerOptionProjection> projections = lecturerRepository.findLecturerOptions();
        return projections.stream().map(p -> new LecturerOptionResponse(
                p.getLecturerId(),
                p.getLecturerCode(),
                p.getFullName(),
                p.getDepartmentId(),
                p.getDepartmentCode() != null ? p.getDepartmentCode() : ""
        )).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AssignLecturerResponse assignLecturer(Long sectionId, AssignLecturerRequest request) {
        CourseSection section = courseSectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lớp học phần."));

        Lecturer lecturer = lecturerRepository.findById(request.lecturerId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy giảng viên."));

        if (lecturer.getLecturerId().equals(section.getLecturerId())) {
            return new AssignLecturerResponse(
                    section.getSectionId(),
                    section.getSectionCode(),
                    lecturer.getLecturerId(),
                    lecturer.getLecturerCode(),
                    lecturer.getFullName(),
                    "Giảng viên đã được gán cho lớp học phần này từ trước."
            );
        }

        // Check trùng lịch mẫu (schedules)
        Integer checkSchedulesVal = courseSectionRepository.checkLecturerScheduleConflict(sectionId, request.lecturerId(), section.getSemesterId());
        boolean checkSchedules = checkSchedulesVal != null && checkSchedulesVal > 0;
        if (checkSchedules) {
            throw new BusinessException("Giảng viên đã có lịch dạy trùng thời gian.");
        }

        // Check trùng buổi học thật (class_sessions) if applyToGeneratedSessions is true
        if (Boolean.TRUE.equals(request.applyToGeneratedSessions())) {
            Integer checkSessionsVal = courseSectionRepository.checkLecturerSessionConflict(sectionId, request.lecturerId());
            boolean checkSessions = checkSessionsVal != null && checkSessionsVal > 0;
            if (checkSessions) {
                throw new BusinessException("Giảng viên đã có buổi dạy trùng trong lịch đã sinh.");
            }
        }

        // Update course_section
        section.setLecturerId(lecturer.getLecturerId());
        courseSectionRepository.save(section);

        // Update future/active class_sessions if applyToGeneratedSessions is true
        if (Boolean.TRUE.equals(request.applyToGeneratedSessions())) {
            List<ClassSession> sessions = classSessionRepository.findBySectionId(sectionId);
            for (ClassSession session : sessions) {
                if (session.getSessionStatus() != SessionStatus.COMPLETED && session.getSessionStatus() != SessionStatus.CANCELLED) {
                    session.setLecturerId(lecturer.getLecturerId());
                    classSessionRepository.save(session);
                }
            }
        }

        return new AssignLecturerResponse(
                section.getSectionId(),
                section.getSectionCode(),
                lecturer.getLecturerId(),
                lecturer.getLecturerCode(),
                lecturer.getFullName(),
                "Phân công giảng viên thành công."
        );
    }

    @Override
    @Transactional
    public AssignLecturerResponse unassignLecturer(Long sectionId) {
        CourseSection section = courseSectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lớp học phần."));

        if (section.getLecturerId() == null) {
            return new AssignLecturerResponse(
                    section.getSectionId(),
                    section.getSectionCode(),
                    null,
                    null,
                    null,
                    "Lớp học phần chưa được gán giảng viên nào."
            );
        }

        // Check if there are future/scheduled class sessions
        List<ClassSession> sessions = classSessionRepository.findBySectionId(sectionId);
        boolean hasFutureOrActiveSessions = sessions.stream().anyMatch(s -> 
            s.getSessionStatus() != SessionStatus.COMPLETED && s.getSessionStatus() != SessionStatus.CANCELLED
        );

        if (hasFutureOrActiveSessions) {
            throw new BusinessException("Không thể gỡ giảng viên vì lớp học phần đã có lịch học được sinh.");
        }

        section.setLecturerId(null);
        courseSectionRepository.save(section);

        return new AssignLecturerResponse(
                section.getSectionId(),
                section.getSectionCode(),
                null,
                null,
                null,
                "Gỡ phân công giảng viên thành công."
        );
    }
}
