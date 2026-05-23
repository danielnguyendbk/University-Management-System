package com.ptit.studentportal.tuition.service;

import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.tuition.dto.TuitionItemResponse;
import com.ptit.studentportal.tuition.entity.TuitionFee;
import com.ptit.studentportal.tuition.repository.TuitionFeeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TuitionFeeService {

    private final TuitionFeeRepository tuitionFeeRepository;
    private final SemesterRepository semesterRepository;

    @PersistenceContext
    private final EntityManager entityManager;

    public List<TuitionFee> getTuitionFeesBySemester(Long semesterId) {
        return tuitionFeeRepository.findBySemesterId(semesterId);
    }

    public TuitionFee getStudentTuition(Long studentId, Long semesterId) {
        return tuitionFeeRepository.findByStudentIdAndSemesterId(studentId, semesterId)
                .orElseThrow(() -> new IllegalArgumentException("No tuition fee found for this student in the given semester"));
    }

    @SuppressWarnings("unchecked")
    public List<TuitionItemResponse> getTuitionItems(Long tuitionFeeId, Long studentId) {
        TuitionFee tuitionFee = tuitionFeeRepository.findById(tuitionFeeId)
                .orElseThrow(() -> new IllegalArgumentException("Tuition fee not found"));

        if (!tuitionFee.getStudentId().equals(studentId)) {
            throw new SecurityException("Unauthorized access to this tuition fee record");
        }

        Semester semester = semesterRepository.findById(tuitionFee.getSemesterId())
                .orElseThrow(() -> new IllegalArgumentException("Semester not found"));
        BigDecimal pricePerCredit = semester.getPricePerCredit() != null ? semester.getPricePerCredit() : BigDecimal.ZERO;

        List<Object[]> registrationResults = entityManager.createNativeQuery(
                "SELECT c.course_code, c.course_name, c.credits " +
                "FROM enrollments e " +
                "JOIN course_sections cs ON e.section_id = cs.section_id " +
                "JOIN courses c ON cs.course_id = c.course_id " +
                "WHERE e.student_id = :studentId " +
                "  AND cs.semester_id = :semesterId " +
                "  AND e.enrollment_status IN ('registered', 'completed')"
        )
        .setParameter("studentId", studentId)
        .setParameter("semesterId", tuitionFee.getSemesterId())
        .getResultList();

        List<TuitionItemResponse> items = new ArrayList<>();
        for (Object[] row : registrationResults) {
            String courseCode = (String) row[0];
            String courseName = (String) row[1];
            Integer credits = ((Number) row[2]).intValue();
            BigDecimal amount = BigDecimal.valueOf(credits).multiply(pricePerCredit);
            items.add(new TuitionItemResponse(courseCode, courseName, credits, pricePerCredit, amount));
        }
        return items;
    }
}
