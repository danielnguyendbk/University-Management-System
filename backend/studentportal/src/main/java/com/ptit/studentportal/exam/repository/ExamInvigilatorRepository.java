package com.ptit.studentportal.exam.repository;

import com.ptit.studentportal.exam.entity.ExamInvigilator;
import com.ptit.studentportal.exam.entity.ExamInvigilatorId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExamInvigilatorRepository extends JpaRepository<ExamInvigilator, ExamInvigilatorId> {
    List<ExamInvigilator> findByExamId(Long examId);
    List<ExamInvigilator> findByLecturerId(Long lecturerId);
    Optional<ExamInvigilator> findByExamIdAndLecturerId(Long examId, Long lecturerId);
    void deleteByExamIdAndLecturerId(Long examId, Long lecturerId);
    void deleteByExamId(Long examId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ei) FROM ExamInvigilator ei WHERE ei.examId = :examId AND UPPER(ei.role) = 'MAIN'")
    long countMainInvigilatorsByExamId(@org.springframework.data.repository.query.Param("examId") Long examId);
}
