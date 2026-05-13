package com.ptit.studentportal.timetable.service;

import org.springframework.web.multipart.MultipartFile;

import com.ptit.studentportal.timetable.dto.response.TimetableImportResult;

public interface TimetableImportService {
	TimetableImportResult importSchedulesFromExcel(MultipartFile file);
}

