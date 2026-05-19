package com.ptit.studentportal.grade;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.lecturer.LecturerRepository;

@Service
@Transactional(readOnly = true)
public class GradeService {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");
    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final Logger logger = LoggerFactory.getLogger(GradeService.class);

    private final GradeRepository gradeRepository;
    private final LecturerRepository lecturerRepository;

    public GradeService(GradeRepository gradeRepository, LecturerRepository lecturerRepository) {
        this.gradeRepository = gradeRepository;
        this.lecturerRepository = lecturerRepository;
    }

    public List<LecturerSectionDTO> getLecturerSections(Long lecturerId) {
        ensureLecturerExists(lecturerId);
        return gradeRepository.findLecturerSections(lecturerId)
                .stream()
                .map(LecturerSectionDTO::fromView)
                .toList();
    }

    public List<GradeDTO> getSectionGrades(Long lecturerId, Long sectionId) {
        ensureLecturerOwnsSection(lecturerId, sectionId);
        logger.info("Loading grades for lecturer {} and section {}", lecturerId, sectionId);
        return gradeRepository.findSectionGrades(sectionId)
                .stream()
                .map(view -> {
                    try {
                        return toDTO(view);
                    } catch (Exception e) {
                        logger.error("Error mapping grade view to DTO: {}", view, e);
                        throw e;
                    }
                })
                .toList();
    }

    public GradeDTO getGradeByEnrollmentId(Long lecturerId, Long enrollmentId) {
        GradeRepository.GradeDetailView view = findGradeDetailAndValidateOwnership(lecturerId, enrollmentId);
        return toDTO(view);
    }

    @Transactional
    public GradeDTO updateGrade(Long lecturerId, Long enrollmentId, GradeUpdateRequest request) {
        GradeRepository.GradeDetailView view = findGradeDetailAndValidateOwnership(lecturerId, enrollmentId);

        BigDecimal totalScore = calculateTotalScore(request);

        Grade grade = gradeRepository.findByEnrollmentId(enrollmentId)
                .orElseGet(() -> Grade.builder()
                        .enrollmentId(enrollmentId)
                        .build());

        grade.setAttendanceScore(normalizeScore(request.attendanceScore()));
        grade.setExerciseScore(normalizeScore(request.exerciseScore()));
        grade.setPracticeScore(normalizeScore(request.practiceScore()));
        grade.setMidtermScore(normalizeScore(request.midtermScore()));
        grade.setFinalScore(normalizeScore(request.finalScore()));
        grade.setTotalScore(totalScore);

        Grade saved = gradeRepository.save(grade);

        return new GradeDTO(
                saved.getGradeId(),
                view.getEnrollmentId(),
                view.getStudentId(),
                view.getStudentCode(),
                view.getStudentName(),
                view.getEnrollmentStatus(),
                view.getSectionId(),
                view.getSectionCode(),
                view.getCourseCode(),
                view.getCourseName(),
                view.getSemesterName(),
                view.getAcademicYear(),
                view.getLecturerId(),
                saved.getAttendanceScore(),
                saved.getExerciseScore(),
                saved.getPracticeScore(),
                saved.getMidtermScore(),
                saved.getFinalScore(),
                saved.getTotalScore()
        );
    }

    private GradeDTO toDTO(GradeRepository.GradeDetailView view) {
        return new GradeDTO(
                view.getGradeId(),
                view.getEnrollmentId(),
                view.getStudentId(),
                view.getStudentCode(),
                view.getStudentName(),
                view.getEnrollmentStatus(),
                view.getSectionId(),
                view.getSectionCode(),
                view.getCourseCode(),
                view.getCourseName(),
                view.getSemesterName(),
                view.getAcademicYear(),
                view.getLecturerId(),
                view.getAttendanceScore(),
                view.getExerciseScore(),
                view.getPracticeScore(),
                view.getMidtermScore(),
                view.getFinalScore(),
                view.getTotalScore()
        );
    }

    private void ensureLecturerExists(Long lecturerId) {
        if (!lecturerRepository.existsById(lecturerId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with id: " + lecturerId);
        }
    }

    private void ensureLecturerOwnsSection(Long lecturerId, Long sectionId) {
        ensureLecturerExists(lecturerId);
        boolean ownsSection = gradeRepository.countSectionOwnedByLecturer(sectionId, lecturerId) > 0;
        if (!ownsSection) {
            throw new AppException(HttpStatus.NOT_FOUND, "Section not found for lecturer: " + lecturerId);
        }
    }

    private GradeRepository.GradeDetailView findGradeDetailAndValidateOwnership(Long lecturerId, Long enrollmentId) {
        ensureLecturerExists(lecturerId);

        GradeRepository.GradeDetailView view = gradeRepository.findGradeDetailByEnrollmentId(enrollmentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Enrollment not found with id: " + enrollmentId));

        if (!lecturerId.equals(view.getLecturerId())) {
            throw new AppException(HttpStatus.NOT_FOUND, "Enrollment not found for lecturer: " + lecturerId);
        }

        return view;
    }

    private BigDecimal calculateTotalScore(GradeUpdateRequest request) {
        BigDecimal attendanceWeight = normalizeWeight(request.attendanceWeight(), "attendanceWeight");
        BigDecimal exerciseWeight = normalizeWeight(request.exerciseWeight(), "exerciseWeight");
        BigDecimal practiceWeight = normalizeWeight(request.practiceWeight(), "practiceWeight");
        BigDecimal midtermWeight = normalizeWeight(request.midtermWeight(), "midtermWeight");
        BigDecimal finalWeight = normalizeWeight(request.finalWeight(), "finalWeight");

        BigDecimal weightSum = attendanceWeight
                .add(exerciseWeight)
                .add(practiceWeight)
                .add(midtermWeight)
                .add(finalWeight);

        if (weightSum.compareTo(HUNDRED) != 0) {
            throw new IllegalArgumentException("Tổng trọng số phải bằng 100");
        }

        BigDecimal attendanceScore = normalizeScore(request.attendanceScore());
        BigDecimal exerciseScore = normalizeScore(request.exerciseScore());
        BigDecimal practiceScore = normalizeScore(request.practiceScore());
        BigDecimal midtermScore = normalizeScore(request.midtermScore());
        BigDecimal finalScore = normalizeScore(request.finalScore());

        validateScoreIfWeighted(attendanceScore, attendanceWeight, "attendanceScore");
        validateScoreIfWeighted(exerciseScore, exerciseWeight, "exerciseScore");
        validateScoreIfWeighted(practiceScore, practiceWeight, "practiceScore");
        validateScoreIfWeighted(midtermScore, midtermWeight, "midtermScore");
        validateScoreIfWeighted(finalScore, finalWeight, "finalScore");

        return attendanceScore.multiply(attendanceWeight)
                .add(exerciseScore.multiply(exerciseWeight))
                .add(practiceScore.multiply(practiceWeight))
                .add(midtermScore.multiply(midtermWeight))
                .add(finalScore.multiply(finalWeight))
                .divide(HUNDRED, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizeWeight(BigDecimal weight, String fieldName) {
        if (weight == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        if (weight.compareTo(ZERO) < 0 || weight.compareTo(HUNDRED) > 0) {
            throw new IllegalArgumentException(fieldName + " must be between 0 and 100");
        }
        return weight.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizeScore(BigDecimal score) {
        return score == null ? ZERO : score.setScale(2, RoundingMode.HALF_UP);
    }

    private void validateScoreIfWeighted(BigDecimal score, BigDecimal weight, String fieldName) {
        if (weight.compareTo(ZERO) > 0 && score == null) {
            throw new IllegalArgumentException(fieldName + " is required when its weight is greater than 0");
        }
        if (score != null && (score.compareTo(ZERO) < 0 || score.compareTo(new BigDecimal("10")) > 0)) {
            throw new IllegalArgumentException(fieldName + " must be between 0 and 10");
        }
    }

    @Transactional
    public List<GradeDTO> batchUpdateGrades(Long lecturerId, BatchGradeUpdateRequest request) {
        ensureLecturerExists(lecturerId);
        return request.grades().stream()
                .map(update -> updateGrade(lecturerId, update.enrollmentId(), update.gradeData()))
                .toList();
    }
}