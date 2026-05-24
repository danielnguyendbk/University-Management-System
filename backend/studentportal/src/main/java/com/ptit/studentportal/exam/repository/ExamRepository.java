package com.ptit.studentportal.exam.repository;

import com.ptit.studentportal.exam.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findBySemesterId(Long semesterId);

    // Overlap room check: same room, same day, intersecting times
    @Query("SELECT e FROM Exam e WHERE e.roomId = :roomId AND e.examDate = :examDate " +
           "AND (:excludeExamId IS NULL OR e.examId <> :excludeExamId) " +
           "AND NOT (e.endTime <= :startTime OR e.startTime >= :endTime)")
    List<Exam> findOverlappingRoomExams(
        @Param("roomId") Long roomId,
        @Param("examDate") LocalDate examDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeExamId") Long excludeExamId
    );

    @Query("SELECT COUNT(e) FROM Exam e WHERE e.sectionId = :sectionId AND e.status <> 'cancel' AND (:excludeExamId IS NULL OR e.examId <> :excludeExamId)")
    long countActiveExamsForSection(@Param("sectionId") Long sectionId, @Param("excludeExamId") Long excludeExamId);

    // Get exams for logged in student
    @Query("SELECT e FROM Exam e " +
           "JOIN CourseSection cs ON e.sectionId = cs.sectionId " +
           "JOIN com.ptit.studentportal.registration.entity.Enrollment en ON en.sectionId = cs.sectionId " +
           "WHERE en.studentId = :studentId " +
           "AND e.semesterId = :semesterId " +
           "AND en.enrollmentStatus IN ('registered', 'completed') " +
           "AND e.status = 'scheduled' " +
           "ORDER BY e.examDate, e.startTime")
    List<Exam> findStudentExams(
        @Param("studentId") Long studentId,
        @Param("semesterId") Long semesterId
    );

    // Find all active exams for student (to check overlapping schedules)
    @Query("SELECT e FROM Exam e " +
           "JOIN CourseSection cs ON e.sectionId = cs.sectionId " +
           "JOIN com.ptit.studentportal.registration.entity.Enrollment en ON en.sectionId = cs.sectionId " +
           "WHERE en.studentId = :studentId " +
           "AND en.enrollmentStatus IN ('registered', 'completed') " +
           "AND e.status <> 'cancel'")
    List<Exam> findActiveExamsForStudent(@Param("studentId") Long studentId);
}
