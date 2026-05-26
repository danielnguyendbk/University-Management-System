package com.ptit.studentportal.tuition.service;

import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.entity.TuitionRate;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import com.ptit.studentportal.tuition.repository.TuitionRateRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TuitionCalculationService {

    private final SemesterRepository semesterRepository;
    private final TuitionFeeRepository tuitionFeeRepository;
    private final TuitionRateRepository tuitionRateRepository;

    @PersistenceContext
    private EntityManager entityManager;

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

        // Fetch all tuition rates by cohort
        List<TuitionRate> rates = tuitionRateRepository.findAll();
        Map<Integer, BigDecimal> cohortRates = rates.stream()
                .collect(Collectors.toMap(TuitionRate::getEnrollmentYear, TuitionRate::getPricePerCredit));

        // Query distinct student IDs, total registered credits, enrollment year, and student code in this semester
        List<Object[]> results = entityManager.createNativeQuery(
                "SELECT e.student_id, SUM(c.credits), s.enrollment_year, s.student_code " +
                "FROM enrollments e " +
                "JOIN course_sections cs ON e.section_id = cs.section_id " +
                "JOIN courses c ON cs.course_id = c.course_id " +
                "JOIN students s ON e.student_id = s.student_id " +
                "WHERE cs.semester_id = :semesterId " +
                "  AND e.enrollment_status IN ('registered', 'completed') " +
                "GROUP BY e.student_id, s.enrollment_year, s.student_code"
        )
        .setParameter("semesterId", semesterId)
        .getResultList();

        log.info("[TuitionCalculation] Generating tuition fees for {} students in semesterId={}", results.size(), semesterId);

        for (Object[] result : results) {
            Long studentId = ((Number) result[0]).longValue();
            int totalCredits = ((Number) result[1]).intValue();
            Integer enrollmentYear = result[2] != null ? ((Number) result[2]).intValue() : null;
            String studentCode = result[3] != null ? (String) result[3] : null;

            // Resolve cohort year (fallback to parsing Dxx from student code if enrollmentYear is null)
            Integer resolvedCohortYear = null;
            if (enrollmentYear != null) {
                resolvedCohortYear = enrollmentYear;
            } else if (studentCode != null && studentCode.matches("^D\\d{2}.*")) {
                try {
                    resolvedCohortYear = 2000 + Integer.parseInt(studentCode.substring(1, 3));
                } catch (NumberFormatException e) {
                    log.warn("Failed to parse cohort year from student code: {}", studentCode);
                }
            }

            // Determine credit price: cohort rate, fallback to semester default
            BigDecimal studentPricePerCredit = null;
            if (resolvedCohortYear != null) {
                studentPricePerCredit = cohortRates.get(resolvedCohortYear);
            }
            if (studentPricePerCredit == null) {
                studentPricePerCredit = semester.getPricePerCredit();
            }

            if (studentPricePerCredit == null || studentPricePerCredit.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException("Price per credit for student " + studentId + " (cohort " + (resolvedCohortYear != null ? resolvedCohortYear : enrollmentYear) + ") has not been configured.");
            }

            BigDecimal totalAmount = BigDecimal.valueOf(totalCredits).multiply(studentPricePerCredit);

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
