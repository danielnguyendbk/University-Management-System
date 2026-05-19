package com.ptit.studentportal.request;

public record RequestAttachmentDTO(
        Long attachmentId,
        Long requestId,
        String fileName,
        String fileUrl
) {
}