package com.ptit.studentportal.lecturer;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LecturerRepository extends JpaRepository<Lecturer, Long> {

    Optional<Lecturer> findByLecturerCode(String lecturerCode);

    Optional<Lecturer> findByUser_UserId(Long userId);

    boolean existsByLecturerCode(String lecturerCode);

    boolean existsByWorkEmail(String workEmail);
}