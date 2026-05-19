package com.ptit.studentportal.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import jakarta.transaction.Transactional;

public interface StudentRequestRepository extends JpaRepository<StudentRequest, Long> {

    @Query(value = """
            SELECT
                sr.request_id AS requestId,
                sr.student_id AS studentId,
                st.student_code AS studentCode,
                st.full_name AS studentName,
                sr.request_type_id AS requestTypeId,
                rt.request_type_code AS requestTypeCode,
                rt.request_type_name AS requestTypeName,
                sr.title AS title,
                sr.content AS content,
                sr.section_id AS sectionId,
                sr.section_code AS sectionCode,
                sr.status AS status,
                sr.processed_by AS processedBy,
                sr.processed_at AS processedAt,
                sr.created_at AS createdAt
            FROM student_requests sr
            JOIN students st ON st.student_id = sr.student_id
            JOIN request_types rt ON rt.request_type_id = sr.request_type_id
            LEFT JOIN course_sections cs ON cs.section_id = sr.section_id
            WHERE sr.status = 'pending'
              AND cs.lecturer_id = :lecturerId
            ORDER BY sr.created_at DESC
            """, nativeQuery = true)
    List<RequestRow> findPendingRequests(@Param("lecturerId") Long lecturerId);

    @Query(value = """
            SELECT
                sr.request_id AS requestId,
                sr.student_id AS studentId,
                st.student_code AS studentCode,
                st.full_name AS studentName,
                sr.request_type_id AS requestTypeId,
                rt.request_type_code AS requestTypeCode,
                rt.request_type_name AS requestTypeName,
                sr.title AS title,
                sr.content AS content,
                sr.section_id AS sectionId,
                sr.section_code AS sectionCode,
                sr.status AS status,
                sr.processed_by AS processedBy,
                sr.processed_at AS processedAt,
                sr.created_at AS createdAt
            FROM student_requests sr
            JOIN students st ON st.student_id = sr.student_id
            JOIN request_types rt ON rt.request_type_id = sr.request_type_id
            WHERE sr.student_id = :studentId
            ORDER BY sr.created_at DESC
            """, nativeQuery = true)
    List<RequestRow> findRequestsByStudentId(@Param("studentId") Long studentId);

    @Query(value = """
            SELECT
                sr.request_id AS requestId,
                sr.student_id AS studentId,
                st.student_code AS studentCode,
                st.full_name AS studentName,
                sr.request_type_id AS requestTypeId,
                rt.request_type_code AS requestTypeCode,
                rt.request_type_name AS requestTypeName,
                sr.title AS title,
                sr.content AS content,
                sr.section_id AS sectionId,
                sr.section_code AS sectionCode,
                sr.status AS status,
                sr.processed_by AS processedBy,
                sr.processed_at AS processedAt,
                sr.created_at AS createdAt
            FROM student_requests sr
            JOIN students st ON st.student_id = sr.student_id
            JOIN request_types rt ON rt.request_type_id = sr.request_type_id
            WHERE sr.request_id = :requestId
            LIMIT 1
            """, nativeQuery = true)
    Optional<RequestRow> findRequestById(@Param("requestId") Long requestId);

    @Query(value = """
            SELECT
                ra.attachment_id AS attachmentId,
                ra.request_id AS requestId,
                ra.file_name AS fileName,
                ra.file_url AS fileUrl
            FROM request_attachments ra
            WHERE ra.request_id IN (:requestIds)
            ORDER BY ra.created_at ASC
            """, nativeQuery = true)
    List<RequestAttachmentRow> findAttachmentsByRequestIds(@Param("requestIds") List<Long> requestIds);

    @Transactional
    @Modifying
    @Query(value = """
            UPDATE student_requests
            SET status = :status,
                processed_by = :processedBy,
                processed_at = CURRENT_TIMESTAMP
            WHERE request_id = :requestId
            """, nativeQuery = true)
    int updateRequestStatus(@Param("requestId") Long requestId, @Param("status") String status, @Param("processedBy") Long processedBy);

    interface RequestRow {
        Long getRequestId();
        Long getStudentId();
        String getStudentCode();
        String getStudentName();
        Long getRequestTypeId();
        String getRequestTypeCode();
        String getRequestTypeName();
        String getTitle();
        String getContent();
        Long getSectionId();
        String getSectionCode();
        String getStatus();
        Long getProcessedBy();
        LocalDateTime getProcessedAt();
        LocalDateTime getCreatedAt();
    }

    interface RequestAttachmentRow {
        Long getAttachmentId();
        Long getRequestId();
        String getFileName();
        String getFileUrl();
    }
}
