package com.ptit.studentportal.lecturer;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LecturerRepository extends JpaRepository<Lecturer, Long>, JpaSpecificationExecutor<Lecturer> {

    Optional<Lecturer> findByLecturerCode(String lecturerCode);

    Optional<Lecturer> findByUser_UserId(Long userId);

    boolean existsByLecturerCode(String lecturerCode);
}