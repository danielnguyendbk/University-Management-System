package com.ptit.studentportal.tuition.repository;

import com.ptit.studentportal.tuition.entity.TuitionFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TuitionFeeRepository extends JpaRepository<TuitionFee, Long> {
    Optional<TuitionFee> findByStudentIdAndSemesterId(Long studentId, Long semesterId);
    List<TuitionFee> findBySemesterId(Long semesterId);
    List<TuitionFee> findByStudentId(Long studentId);
}
