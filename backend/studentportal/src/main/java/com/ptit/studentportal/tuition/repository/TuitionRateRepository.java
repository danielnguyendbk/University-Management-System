package com.ptit.studentportal.tuition.repository;

import com.ptit.studentportal.tuition.entity.TuitionRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TuitionRateRepository extends JpaRepository<TuitionRate, Long> {
    Optional<TuitionRate> findByEnrollmentYear(Integer enrollmentYear);
}
