package com.ptit.studentportal.request;

import java.time.LocalDateTime;
import java.util.List;

public record StudentRequestDTO(
        Long requestId,
        Long studentId,
        String studentCode,
        String studentName,
        Long requestTypeId,
        String requestTypeCode,
        String requestTypeName,
        String title,
        String content,
        String status,
        Long processedBy,
        LocalDateTime processedAt,
        LocalDateTime createdAt,
        Long sectionId,
        String sectionCode,
        List<RequestAttachmentDTO> attachments
) {
}