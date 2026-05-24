package com.ptit.studentportal.lecturer;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;

@Service
@Transactional(readOnly = true)
public class LecturerCourseSectionService {

    private final UserRepository userRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseSectionRepository courseSectionRepository;

    public LecturerCourseSectionService(UserRepository userRepository,
                                        LecturerRepository lecturerRepository,
                                        CourseSectionRepository courseSectionRepository) {
        this.userRepository = userRepository;
        this.lecturerRepository = lecturerRepository;
        this.courseSectionRepository = courseSectionRepository;
    }

    public List<LecturerCourseSectionResponse> getMyCourseSections(String username, Long semesterId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found: " + username));

        Lecturer lecturer = lecturerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer profile not found for user: " + username));

        List<LecturerCourseSectionProjection> projections = courseSectionRepository.findLecturerCourseSections(lecturer.getLecturerId(), semesterId);

        if (projections == null || projections.isEmpty()) {
            return List.of();
        }

        return projections.stream()
                .map(p -> new LecturerCourseSectionResponse(
                        p.getSectionId(),
                        p.getSectionCode(),
                        p.getCourseId(),
                        p.getCourseCode(),
                        p.getCourseName(),
                        p.getCredits(),
                        p.getSemesterId(),
                        p.getSemesterCode(),
                        p.getSemesterName(),
                        p.getClassId(),
                        p.getClassCode(),
                        p.getMaxCapacity(),
                        p.getStatus(),
                        p.getCurrentCapacity(),
                        p.getRemainingCapacity(),
                        convertToBoolean(p.getHasSchedule()),
                        convertToBoolean(p.getHasGeneratedSessions())
                ))
                .collect(Collectors.toList());
    }

    private boolean convertToBoolean(Object val) {
        if (val == null) return false;
        if (val instanceof Boolean) return (Boolean) val;
        if (val instanceof Number) return ((Number) val).intValue() > 0;
        if (val instanceof String) return "1".equals(val) || "true".equalsIgnoreCase((String) val);
        return false;
    }
}
