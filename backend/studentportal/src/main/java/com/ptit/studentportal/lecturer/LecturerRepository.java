package com.ptit.studentportal.lecturer;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LecturerRepository extends JpaRepository<Lecturer, Long> {

    Optional<Lecturer> findByLecturerCode(String lecturerCode);

    Optional<Lecturer> findByUser_UserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT l FROM Lecturer l WHERE l.user.userId = :userId")
    Optional<Lecturer> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    boolean existsByLecturerCode(String lecturerCode);

    boolean existsByWorkEmail(String workEmail);

    @Query(value = """
            SELECT 
                l.lecturer_id AS lecturerId,
                l.lecturer_code AS lecturerCode,
                l.full_name AS fullName,
                l.department_id AS departmentId,
                d.department_code AS departmentCode
            FROM lecturers l
            LEFT JOIN departments d ON d.department_id = l.department_id
            ORDER BY l.lecturer_code
            """, nativeQuery = true)
    List<com.ptit.studentportal.assignment.dto.LecturerOptionProjection> findLecturerOptions();
}