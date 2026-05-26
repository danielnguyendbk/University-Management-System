package com.ptit.studentportal.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.request.StudentRequestRepository.RequestRow;
import com.ptit.studentportal.student.StudentRepository;
import com.ptit.studentportal.studentgrade.StudentGradesRepository;

@Service
@Transactional(readOnly = true)
public class RequestService {

    private final StudentRequestRepository studentRequestRepository;
    private final LecturerRepository lecturerRepository;
    private final StudentRepository studentRepository;
    private final RequestTypeRepository requestTypeRepository;
    private final StudentGradesRepository studentGradesRepository;
    private final RequestAttachmentRepository requestAttachmentRepository;
    private final RequestAttachmentStorageService requestAttachmentStorageService;

    public RequestService(
            StudentRequestRepository studentRequestRepository,
            LecturerRepository lecturerRepository,
            StudentRepository studentRepository,
            RequestTypeRepository requestTypeRepository,
            StudentGradesRepository studentGradesRepository) {
        this(studentRequestRepository, lecturerRepository, studentRepository, requestTypeRepository, studentGradesRepository, null, null);
    }

    @Autowired
    public RequestService(
            StudentRequestRepository studentRequestRepository,
            LecturerRepository lecturerRepository,
            StudentRepository studentRepository,
            RequestTypeRepository requestTypeRepository,
            StudentGradesRepository studentGradesRepository,
            RequestAttachmentRepository requestAttachmentRepository,
            RequestAttachmentStorageService requestAttachmentStorageService) {
        this.studentRequestRepository = studentRequestRepository;
        this.lecturerRepository = lecturerRepository;
        this.studentRepository = studentRepository;
        this.requestTypeRepository = requestTypeRepository;
        this.studentGradesRepository = studentGradesRepository;
        this.requestAttachmentRepository = requestAttachmentRepository;
        this.requestAttachmentStorageService = requestAttachmentStorageService;
    }

    public List<StudentRequestDTO> getStudentRequests(Long studentId) {
        ensureStudentExists(studentId);
        return toDTOs(studentRequestRepository.findRequestsByStudentId(studentId));
    }

    @Transactional
    public StudentRequestDTO submitStudentRequest(Long studentId, StudentRequestCreateRequest request) {
        return submitStudentRequest(studentId, request, null);
    }

    @Transactional
    public StudentRequestDTO submitStudentRequest(Long studentId, StudentRequestCreateRequest request, MultipartFile attachment) {
        ensureStudentExists(studentId);

        RequestType requestType = requestTypeRepository.findByRequestTypeCode(request.requestTypeCode())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Unknown request type: " + request.requestTypeCode()));

        if ("leave_request".equalsIgnoreCase(request.requestTypeCode())) {
            validateLeaveRequest(studentId, request);
        }

        String normalizedContent = buildContent(request);

        StudentRequest entity = StudentRequest.builder()
                .studentId(studentId)
                .requestTypeId(requestType.getRequestTypeId())
                .title(request.title())
                .content(normalizedContent)
            .sectionId(request.sectionId())
            .sectionCode(request.sectionCode())
                .status("pending")
                .processedBy(null)
                .processedAt(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        StudentRequest saved = studentRequestRepository.save(entity);

        if (attachment != null && !attachment.isEmpty() && requestAttachmentRepository != null && requestAttachmentStorageService != null) {
            RequestAttachmentStorageService.StoredAttachment storedAttachment =
                requestAttachmentStorageService.store(saved.getRequestId(), attachment);

            requestAttachmentRepository.save(RequestAttachment.builder()
                .requestId(saved.getRequestId())
                .fileName(storedAttachment.fileName())
                .fileUrl(storedAttachment.fileUrl())
                .createdAt(LocalDateTime.now())
                .build());
        }

        RequestRow row = studentRequestRepository.findRequestById(saved.getRequestId())
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to load submitted request"));

        return toDTO(row, List.of());
    }

    public List<StudentRequestDTO> getPendingRequests(Long lecturerId) {
        ensureLecturerExists(lecturerId);
        return toDTOs(studentRequestRepository.findPendingRequests(lecturerId));
    }

    public StudentRequestDTO getRequestById(Long lecturerId, Long requestId) {
        ensureLecturerExists(lecturerId);
        StudentRequestRepository.RequestRow row = studentRequestRepository.findRequestById(requestId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Request not found with id: " + requestId));

        return toDTO(row, loadAttachments(List.of(requestId)).getOrDefault(requestId, List.of()));
    }

    @Transactional
    public StudentRequestDTO approveRequest(Long lecturerId, Long requestId, RequestDecisionRequest request) {
        return processDecision(lecturerId, requestId, "approved");
    }

    @Transactional
    public StudentRequestDTO rejectRequest(Long lecturerId, Long requestId, RequestDecisionRequest request) {
        return processDecision(lecturerId, requestId, "rejected");
    }

    private StudentRequestDTO processDecision(Long lecturerId, Long requestId, String status) {
        Long lecturerUserId = ensureLecturerExists(lecturerId);

        StudentRequestRepository.RequestRow existing = studentRequestRepository.findRequestById(requestId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Request not found with id: " + requestId));

        if (!"pending".equalsIgnoreCase(existing.getStatus())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Request has already been processed");
        }

        int updated = studentRequestRepository.updateRequestStatus(requestId, status, lecturerUserId);
        if (updated == 0) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to update request status");
        }

        return getRequestById(lecturerId, requestId);
    }

    private List<StudentRequestDTO> toDTOs(List<StudentRequestRepository.RequestRow> rows) {
        Map<Long, List<RequestAttachmentDTO>> attachmentsByRequest = loadAttachments(
                rows.stream().map(StudentRequestRepository.RequestRow::getRequestId).toList());

        return rows.stream()
                .map(row -> toDTO(row, attachmentsByRequest.getOrDefault(row.getRequestId(), List.of())))
                .collect(Collectors.toList());
    }

    private StudentRequestDTO toDTO(StudentRequestRepository.RequestRow row, List<RequestAttachmentDTO> attachments) {
        return new StudentRequestDTO(
                row.getRequestId(),
                row.getStudentId(),
                row.getStudentCode(),
                row.getStudentName(),
                row.getRequestTypeId(),
                row.getRequestTypeCode(),
                row.getRequestTypeName(),
                row.getTitle(),
                row.getContent(),
                row.getStatus(),
                row.getProcessedBy(),
                row.getProcessedAt(),
                row.getCreatedAt(),
                row.getSectionId(),
                row.getSectionCode(),
                attachments
        );
    }

    private Map<Long, List<RequestAttachmentDTO>> loadAttachments(List<Long> requestIds) {
        if (requestIds == null || requestIds.isEmpty()) {
            return Map.of();
        }

        return studentRequestRepository.findAttachmentsByRequestIds(requestIds).stream()
                .map(row -> new RequestAttachmentDTO(
                        row.getAttachmentId(),
                        row.getRequestId(),
                        row.getFileName(),
                        row.getFileUrl()))
                .collect(Collectors.groupingBy(RequestAttachmentDTO::requestId));
    }

    private Long ensureLecturerExists(Long lecturerId) {
        return lecturerRepository.findById(lecturerId)
                .map(lecturer -> lecturer.getUser().getUserId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Lecturer not found with id: " + lecturerId));
    }

    private void ensureStudentExists(Long studentId) {
        studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + studentId));
    }

    private String buildContent(StudentRequestCreateRequest request) {
        StringBuilder builder = new StringBuilder(request.content().trim());

        if (request.fromDate() != null) {
            builder.append("\n\nNgày nghỉ: ").append(request.fromDate());
        }

        if (request.sectionCode() != null && !request.sectionCode().isBlank()) {
            builder.append("\nLớp học phần: ").append(request.sectionCode().trim());
        }

        if (request.sectionId() != null) {
            builder.append("\nMã lớp học phần: ").append(request.sectionId());
        }

        if (request.courseCode() != null && !request.courseCode().isBlank()) {
            builder.append("\nMã môn: ").append(request.courseCode().trim());
        }

        if (request.courseName() != null && !request.courseName().isBlank()) {
            builder.append("\nTên môn: ").append(request.courseName().trim());
        }

        if (request.attachmentFileName() != null && !request.attachmentFileName().isBlank()) {
            builder.append("\nTệp đính kèm: ").append(request.attachmentFileName().trim());
        }

        return builder.toString();
    }

    private void validateLeaveRequest(Long studentId, StudentRequestCreateRequest request) {
        if (request.fromDate() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Leave request requires a single date");
        }

        if (request.sectionId() == null || request.sectionCode() == null || request.sectionCode().isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Leave request requires a class section");
        }

        List<StudentGradesRepository.StudentGradeRow> currentSemesterRows = getCurrentSemesterRows(studentId);

        boolean enrolled = currentSemesterRows.stream()
                .anyMatch(row -> request.sectionId().equals(row.getSectionId())
                        || request.sectionCode().equalsIgnoreCase(row.getSectionCode()));

        if (!enrolled) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Selected section does not belong to the current semester");
        }
    }

    private List<StudentGradesRepository.StudentGradeRow> getCurrentSemesterRows(Long studentId) {
        List<StudentGradesRepository.StudentGradeRow> rows = studentGradesRepository.findStudentGradeRows(studentId);
        Long currentSemesterId = rows.stream()
                .map(StudentGradesRepository.StudentGradeRow::getSemesterId)
                .filter(semesterId -> semesterId != null)
                .max(Long::compareTo)
                .orElse(null);

        if (currentSemesterId == null) {
            return List.of();
        }

        return rows.stream()
                .filter(row -> currentSemesterId.equals(row.getSemesterId()))
                .toList();
    }
}