package com.ptit.studentportal.lecturer;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.user.User;
import com.ptit.studentportal.user.UserRepository;
import com.ptit.studentportal.user.UserRole;

@Service
@Transactional(readOnly = true)
public class LecturerService {

    private final LecturerRepository lecturerRepository;
    private final UserRepository userRepository;

    public LecturerService(LecturerRepository lecturerRepository, UserRepository userRepository) {
        this.lecturerRepository = lecturerRepository;
        this.userRepository = userRepository;
    }

    public List<LecturerDTO> getAllLecturers() {
        return lecturerRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public LecturerDTO getLecturerById(Long lecturerId) {
        Lecturer lecturer = lecturerRepository.findById(lecturerId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with id: " + lecturerId));
        return toDTO(lecturer);
    }

    public LecturerDTO getLecturerByCode(String lecturerCode) {
        Lecturer lecturer = lecturerRepository.findByLecturerCode(lecturerCode)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with code: " + lecturerCode));
        return toDTO(lecturer);
    }

    @Transactional
    public LecturerDTO createLecturer(LecturerCreateRequest request) {
        if (lecturerRepository.existsByLecturerCode(request.lecturerCode())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Lecturer code already exists: " + request.lecturerCode());
        }

        if (lecturerRepository.existsByWorkEmail(request.workEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Work email already exists: " + request.workEmail());
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found with id: " + request.userId()));

        if (user.getRole() != UserRole.LECTURER) {
            throw new AppException(HttpStatus.BAD_REQUEST, "User role must be LECTURER");
        }

        lecturerRepository.findByUser_UserId(request.userId())
                .ifPresent(existing -> {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Lecturer already linked to user id: " + request.userId());
                });

        Lecturer lecturer = Lecturer.builder()
                .user(user)
                .departmentId(request.departmentId())
                .lecturerCode(request.lecturerCode())
                .fullName(request.fullName())
                .workEmail(request.workEmail())
                .phone(request.phone())
                .academicTitle(request.academicTitle())
                .build();

        Lecturer saved = lecturerRepository.save(lecturer);
        return toDTO(saved);
    }

    private LecturerDTO toDTO(Lecturer lecturer) {
        return new LecturerDTO(
                lecturer.getLecturerId(),
                lecturer.getUser().getUserId(),
                lecturer.getUser().getUsername(),
                lecturer.getUser().getEmail(),
                lecturer.getUser().getRole(),
                lecturer.getUser().getStatus(),
                lecturer.getDepartmentId(),
                lecturer.getLecturerCode(),
                lecturer.getFullName(),
                lecturer.getWorkEmail(),
                lecturer.getPhone(),
                lecturer.getAcademicTitle()
        );
    }
}