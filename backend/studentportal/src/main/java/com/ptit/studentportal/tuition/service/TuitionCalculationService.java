package com.ptit.studentportal.tuition.service;

import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TuitionCalculationService {

    private final SemesterRepository semesterRepository;
    private final TuitionFeeRepository tuitionFeeRepository;

    @PersistenceContext
    private final EntityManager entityManager;

    @Transactional
    public void setCreditPrice(Long semesterId, BigDecimal pricePerCredit) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found"));
        semester.setPricePerCredit(pricePerCredit);
        semesterRepository.save(semester);
        log.info("[TuitionCalculation] Set credit price for semesterId={} to {}", semesterId, pricePerCredit);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public void generateTuitionFees(Long semesterId) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found"));
        BigDecimal pricePerCredit = semester.getPricePerCredit();
        if (pricePerCredit == null || pricePerCredit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Price per credit for this semester has not been configured or is invalid.");
        }

        // Query distinct student IDs and their total registered credits in this semester
        List<Object[]> results = entityManager.createNativeQuery(
                "SELECT e.student_id, SUM(c.credits) " +
                "FROM enrollments e " +
                "JOIN course_sections cs ON e.section_id = cs.section_id " +
                "JOIN courses c ON cs.course_id = c.course_id " +
                "WHERE cs.semester_id = :semesterId " +
                "  AND e.enrollment_status IN ('registered', 'completed') " +
                "GROUP BY e.student_id"
        )
        .setParameter("semesterId", semesterId)
        .getResultList();

        log.info("[TuitionCalculation] Generating tuition fees for {} students in semesterId={}", results.size(), semesterId);

        for (Object[] result : results) {
            Long studentId = ((Number) result[0]).longValue();
            int totalCredits = ((Number) result[1]).intValue();

            BigDecimal totalAmount = BigDecimal.valueOf(totalCredits).multiply(pricePerCredit);

            Optional<TuitionFee> existingOpt = tuitionFeeRepository.findByStudentIdAndSemesterId(studentId, semesterId);
            if (existingOpt.isPresent()) {
                TuitionFee existing = existingOpt.get();
                BigDecimal discount = existing.getDiscountAmount() != null ? existing.getDiscountAmount() : BigDecimal.ZERO;
                BigDecimal finalAmount = totalAmount.subtract(discount).max(BigDecimal.ZERO);
                BigDecimal paidAmount = existing.getPaidAmount() != null ? existing.getPaidAmount() : BigDecimal.ZERO;

                existing.setTotalCredits(totalCredits);
                existing.setTotalAmount(totalAmount);
                existing.setFinalAmount(finalAmount);

                // Update Status based on paid amount (using string statuses)
                if (paidAmount.compareTo(finalAmount) >= 0) {
                    existing.setStatus("paid");
                } else if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
                    existing.setStatus("partical");
                } else {
                    existing.setStatus("unpaid");
                }
                tuitionFeeRepository.save(existing);
            } else {
                TuitionFee tuitionFee = TuitionFee.builder()
                        .studentId(studentId)
                        .semesterId(semesterId)
                        .totalCredits(totalCredits)
                        .totalAmount(totalAmount)
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(totalAmount)
                        .paidAmount(BigDecimal.ZERO)
                        .status("unpaid")
                        .build();
                tuitionFeeRepository.save(tuitionFee);
            }
        }
    }
}
