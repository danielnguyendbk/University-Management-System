package com.ptit.studentportal.request;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class RequestAttachmentStorageService {

    private final Path rootDirectory;

    public RequestAttachmentStorageService(
            @Value("${app.upload.request-attachments-dir:uploads/request-attachments}") String uploadDirectory) {
        this.rootDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    }

    public StoredAttachment store(Long requestId, MultipartFile file) {
        try {
            Files.createDirectories(rootDirectory);

            String originalFileName = sanitizeFileName(file.getOriginalFilename());
            String storedFileName = requestId + "_" + UUID.randomUUID() + "_" + originalFileName;
            Path target = rootDirectory.resolve(storedFileName).normalize();

            Files.copy(file.getInputStream(), target);

            String fileUrl = "/uploads/request-attachments/" + storedFileName;
            return new StoredAttachment(originalFileName, fileUrl);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store request attachment", exception);
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "attachment";
        }

        String sanitized = fileName.replaceAll("[\\\\/]+", "_").replaceAll("[^a-zA-Z0-9._-]", "_");
        return sanitized.isBlank() ? "attachment" : sanitized;
    }

    public record StoredAttachment(String fileName, String fileUrl) {
    }
}