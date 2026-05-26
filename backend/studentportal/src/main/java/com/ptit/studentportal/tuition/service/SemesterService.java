package com.ptit.studentportal.tuition.service;

import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository semesterRepository;

    @Transactional
    public void updatePricePerCredit(Long semesterId, BigDecimal pricePerCredit, String adminUsername) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found"));
        semester.setPricePerCredit(pricePerCredit);
        semesterRepository.save(semester);
        log.info("[SemesterService] Admin '{}' updated price per credit for semesterId={} to {} at {}", 
                adminUsername, semesterId, pricePerCredit, LocalDateTime.now());
    }
}
