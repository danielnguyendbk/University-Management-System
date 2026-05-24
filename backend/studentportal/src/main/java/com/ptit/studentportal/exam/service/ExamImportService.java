package com.ptit.studentportal.exam.service;

import com.ptit.studentportal.commom.exception.AppException;
import com.ptit.studentportal.exam.dto.ExcelPreviewResponse;
import com.ptit.studentportal.exam.entity.Exam;
import com.ptit.studentportal.exam.entity.ExamInvigilator;
import com.ptit.studentportal.exam.repository.ExamInvigilatorRepository;
import com.ptit.studentportal.exam.repository.ExamRepository;
import com.ptit.studentportal.lecturer.Lecturer;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.registration.repository.EnrollmentRepository;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Room;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.RoomRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExamImportService {

    private final ExamRepository examRepository;
    private final ExamInvigilatorRepository examInvigilatorRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final RoomRepository roomRepository;
    private final SemesterRepository semesterRepository;
    private final LecturerRepository lecturerRepository;
    private final EnrollmentRepository enrollmentRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private static final String[] EXAMS_IMPORT_HEADERS = {
        "action", "semester_id", "section_code", "room_code", "exam_type", 
        "exam_method", "exam_date", "start_time", "end_time", "status", "note"
    };

    private static final String[] INVIGILATORS_IMPORT_HEADERS = {
        "semester_id", "section_code", "exam_date", "start_time", 
        "room_code", "lecturer_code", "invigilator_role", "note"
    };

    public byte[] generateImportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle textStyle = workbook.createCellStyle();
            DataFormat fmt = workbook.createDataFormat();
            textStyle.setDataFormat(fmt.getFormat("@"));

            // 1. Sheet HUONG_DAN
            Sheet guideSheet = workbook.createSheet("HUONG_DAN");
            Row guideRow = guideSheet.createRow(0);
            guideRow.createCell(0).setCellValue("HƯỚNG DẪN IMPORT LỊCH THI");
            guideRow.getCell(0).setCellStyle(headerStyle);
            
            String[] instructions = {
                "- Admin KHÔNG nhập sĩ số và dãy ghế. Sĩ số do backend tự tính dựa trên enrollments.",
                "- section_code, room_code, lecturer_code phải lấy chính xác từ sheet LOOKUPS.",
                "- exam_date nhập dạng yyyy-MM-dd (vd: 2026-06-01).",
                "- start_time và end_time nhập dạng HH:mm (vd: 08:00, 09:30).",
                "- Nếu status = SCHEDULED thì cần có ít nhất 1 giám thị MAIN trong INVIGILATORS_IMPORT.",
                "- Giảng viên không được coi thi lớp mình dạy."
            };
            for(int i = 0; i < instructions.length; i++) {
                guideSheet.createRow(i + 1).createCell(0).setCellValue(instructions[i]);
            }
            guideSheet.autoSizeColumn(0);

            // 2. Sheet EXAMS_IMPORT
            Sheet examsSheet = workbook.createSheet("EXAMS_IMPORT");
            Row examHeaderRow = examsSheet.createRow(0);
            for (int i = 0; i < EXAMS_IMPORT_HEADERS.length; i++) {
                Cell cell = examHeaderRow.createCell(i);
                cell.setCellValue(EXAMS_IMPORT_HEADERS[i]);
                cell.setCellStyle(headerStyle);
                examsSheet.setDefaultColumnStyle(i, textStyle);
                examsSheet.autoSizeColumn(i);
            }

            // 3. Sheet INVIGILATORS_IMPORT
            Sheet invSheet = workbook.createSheet("INVIGILATORS_IMPORT");
            Row invHeaderRow = invSheet.createRow(0);
            for (int i = 0; i < INVIGILATORS_IMPORT_HEADERS.length; i++) {
                Cell cell = invHeaderRow.createCell(i);
                cell.setCellValue(INVIGILATORS_IMPORT_HEADERS[i]);
                cell.setCellStyle(headerStyle);
                invSheet.setDefaultColumnStyle(i, textStyle);
                invSheet.autoSizeColumn(i);
            }
            
            // 4. Sheet DATA_MAU_DUNG
            Sheet sampleSheet = workbook.createSheet("DATA_MAU_DUNG");
            sampleSheet.createRow(0).createCell(0).setCellValue("MẪU LỊCH THI (Dữ liệu tham khảo, copy qua sheet chính)");
            Row sampleExamHeader = sampleSheet.createRow(1);
            for (int i = 0; i < EXAMS_IMPORT_HEADERS.length; i++) {
                sampleExamHeader.createCell(i).setCellValue(EXAMS_IMPORT_HEADERS[i]);
                sampleExamHeader.getCell(i).setCellStyle(headerStyle);
            }
            Row sampleExamRow = sampleSheet.createRow(2);
            String[] examSampleData = {"CREATE", "4", "CN205.01", "A101", "midterm", "WRITTEN", "2026-06-01", "08:00", "09:30", "DRAFT", "Thi giữa kỳ"};
            for (int i = 0; i < examSampleData.length; i++) sampleExamRow.createCell(i).setCellValue(examSampleData[i]);
            
            sampleSheet.createRow(4).createCell(0).setCellValue("MẪU GIÁM THỊ (Dữ liệu tham khảo, copy qua sheet chính)");
            Row sampleInvHeader = sampleSheet.createRow(5);
            for (int i = 0; i < INVIGILATORS_IMPORT_HEADERS.length; i++) {
                sampleInvHeader.createCell(i).setCellValue(INVIGILATORS_IMPORT_HEADERS[i]);
                sampleInvHeader.getCell(i).setCellStyle(headerStyle);
            }
            Row sampleInvRow = sampleSheet.createRow(6);
            String[] invSampleData = {"4", "CN205.01", "2026-06-01", "08:00", "A101", "GV002", "MAIN", "Giám thị chính"};
            for (int i = 0; i < invSampleData.length; i++) sampleInvRow.createCell(i).setCellValue(invSampleData[i]);
            
            for(int i = 0; i < 11; i++) sampleSheet.autoSizeColumn(i);

            // 5. Sheet LOOKUPS
            Sheet lookupSheet = workbook.createSheet("LOOKUPS");
            Row lookupHeaderRow = lookupSheet.createRow(0);
            String[] lookupHeaders = {"Loại dữ liệu", "ID/Mã", "Tên/Mô tả"};
            for (int i = 0; i < lookupHeaders.length; i++) {
                Cell c = lookupHeaderRow.createCell(i);
                c.setCellValue(lookupHeaders[i]);
                c.setCellStyle(headerStyle);
            }
            int rIdx = 1;
            
            for(Semester s : semesterRepository.findAll()) {
                Row r = lookupSheet.createRow(rIdx++);
                r.createCell(0).setCellValue("Học kỳ (semester_id)");
                r.createCell(1).setCellValue(s.getSemesterId());
                r.createCell(2).setCellValue(s.getSemesterName() + " (" + s.getStartDate() + " to " + s.getEndDate() + ")");
            }
            for(Room rm : roomRepository.findAll()) {
                Row r = lookupSheet.createRow(rIdx++);
                r.createCell(0).setCellValue("Phòng thi (room_code)");
                r.createCell(1).setCellValue(rm.getRoomCode());
                r.createCell(2).setCellValue("Sức chứa: " + rm.getCapacity());
            }
            for(Lecturer l : lecturerRepository.findAll()) {
                Row r = lookupSheet.createRow(rIdx++);
                r.createCell(0).setCellValue("Giảng viên (lecturer_code)");
                r.createCell(1).setCellValue(l.getLecturerCode());
                r.createCell(2).setCellValue(l.getLecturerCode());
            }
            lookupSheet.autoSizeColumn(0);
            lookupSheet.autoSizeColumn(1);
            lookupSheet.autoSizeColumn(2);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi tạo file mẫu Excel: " + e.getMessage());
        }
    }

    public ExcelPreviewResponse previewExcelImport(MultipartFile file, Long semesterIdParam) {
        return processExcelFile(file, semesterIdParam, false);
    }

    @Transactional
    public ExcelPreviewResponse confirmExcelImport(MultipartFile file, Long semesterIdParam) {
        return processExcelFile(file, semesterIdParam, true);
    }

    private ExcelPreviewResponse processExcelFile(MultipartFile file, Long semesterIdParam, boolean isConfirm) {
        ExcelPreviewResponse response = new ExcelPreviewResponse();
        response.setErrors(new ArrayList<>());
        response.setPreviewItems(new ArrayList<>());
        
        if (file == null || file.isEmpty()) {
            addError(response, "FILE", 0, "file", "ERROR", "File tải lên không được để trống");
            response.setSuccess(false);
            return response;
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            addError(response, "FILE", 0, "format", "ERROR", "Định dạng file không hợp lệ. Chỉ chấp nhận .xlsx hoặc .xls");
            response.setSuccess(false);
            return response;
        }

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet examsSheet = workbook.getSheet("EXAMS_IMPORT");
            if (examsSheet == null) {
                addError(response, "FILE", 0, "sheet", "ERROR", "File thiếu sheet EXAMS_IMPORT");
                response.setSuccess(false);
                return response;
            }
            
            Sheet invSheet = workbook.getSheet("INVIGILATORS_IMPORT");

            // Parse Headers
            Map<String, Integer> examHeaderMap = buildHeaderMap(examsSheet);
            Map<String, Integer> invHeaderMap = buildHeaderMap(invSheet);
            
            // Check missing required headers in EXAMS_IMPORT
            for (String h : EXAMS_IMPORT_HEADERS) {
                if (!examHeaderMap.containsKey(h)) {
                    addError(response, "EXAMS_IMPORT", 1, "header", "ERROR", "Thiếu cột bắt buộc: " + h);
                }
            }
            if (invSheet != null) {
                for (String h : INVIGILATORS_IMPORT_HEADERS) {
                    if (!invHeaderMap.containsKey(h)) {
                        addError(response, "INVIGILATORS_IMPORT", 1, "header", "ERROR", "Thiếu cột bắt buộc: " + h);
                    }
                }
            }
            
            if (!response.getErrors().isEmpty()) {
                response.setSuccess(false);
                return response;
            }

            int rowCount = examsSheet.getPhysicalNumberOfRows();
            response.setTotalRows(Math.max(0, rowCount - 1));

            // Load cache
            Map<String, CourseSection> sectionCache = new HashMap<>();
            List<CourseSection> allSections = courseSectionRepository.findAll();
            for (CourseSection s : allSections) {
                sectionCache.put(s.getSectionCode() + "_" + s.getSemesterId(), s);
            }

            Map<String, Room> roomCache = new HashMap<>();
            for (Room r : roomRepository.findAll()) {
                roomCache.put(r.getRoomCode(), r);
            }
            
            Map<String, Lecturer> lecturerCache = new HashMap<>();
            for (Lecturer l : lecturerRepository.findAll()) {
                lecturerCache.put(l.getLecturerCode(), l);
            }
            
            Map<Long, Semester> semCache = new HashMap<>();
            for(Semester s: semesterRepository.findAll()) {
                semCache.put(s.getSemesterId(), s);
            }

            List<ExamPayload> examPayloads = new ArrayList<>();
            List<InvigilatorPayload> invPayloads = new ArrayList<>();
            
            // Parse INVIGILATORS_IMPORT
            if (invSheet != null) {
                for (int i = 1; i <= invSheet.getLastRowNum(); i++) {
                    Row row = invSheet.getRow(i);
                    if (row == null || isRowEmpty(row)) continue;
                    
                    try {
                        Long semId = getLongValue(getCellByHeader(row, invHeaderMap, "semester_id"), response, "INVIGILATORS_IMPORT", i + 1, "semester_id");
                        String sectionCode = getStringValue(getCellByHeader(row, invHeaderMap, "section_code"));
                        LocalDate date = parseDate(getCellByHeader(row, invHeaderMap, "exam_date"), response, "INVIGILATORS_IMPORT", i + 1, "exam_date");
                        LocalTime start = parseTime(getCellByHeader(row, invHeaderMap, "start_time"), response, "INVIGILATORS_IMPORT", i + 1, "start_time");
                        String roomCode = getStringValue(getCellByHeader(row, invHeaderMap, "room_code"));
                        String lecCode = getStringValue(getCellByHeader(row, invHeaderMap, "lecturer_code"));
                        String role = getStringValue(getCellByHeader(row, invHeaderMap, "invigilator_role"));
                        if (role != null) {
                            String r = role.trim().toUpperCase();
                            if (r.contains("MAIN") || r.contains("CHÍNH")) {
                                role = "MAIN";
                            } else {
                                role = "ASSISTANT";
                            }
                        } else {
                            role = "ASSISTANT";
                        }
                        String note = getStringValue(getCellByHeader(row, invHeaderMap, "note"));
                        
                        if (semId != null && sectionCode != null && date != null && start != null && roomCode != null && lecCode != null) {
                            invPayloads.add(new InvigilatorPayload(semId, sectionCode, date, start, roomCode, lecCode, role, note, i + 1));
                        } else {
                            addError(response, "INVIGILATORS_IMPORT", i + 1, "missing_fields", "WARNING", "Thiếu các cột bắt buộc trong sheet giám thị");
                        }
                    } catch (Exception e) {
                        addError(response, "INVIGILATORS_IMPORT", i + 1, "various", "WARNING", "Lỗi định dạng dòng: " + e.getMessage());
                    }
                }
            }

            // Parse EXAMS_IMPORT
            for (int i = 1; i <= examsSheet.getLastRowNum(); i++) {
                Row row = examsSheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                ExamPayload payload = new ExamPayload();
                payload.rowNum = i + 1;
                
                try {
                    payload.action = getStringValue(getCellByHeader(row, examHeaderMap, "action"));
                    payload.semesterId = getLongValue(getCellByHeader(row, examHeaderMap, "semester_id"), response, "EXAMS_IMPORT", payload.rowNum, "semester_id");
                    payload.sectionCode = getStringValue(getCellByHeader(row, examHeaderMap, "section_code"));
                    payload.roomCode = getStringValue(getCellByHeader(row, examHeaderMap, "room_code"));
                    payload.examType = getStringValue(getCellByHeader(row, examHeaderMap, "exam_type"));
                    payload.examMethod = getStringValue(getCellByHeader(row, examHeaderMap, "exam_method"));
                    payload.examDate = parseDate(getCellByHeader(row, examHeaderMap, "exam_date"), response, "EXAMS_IMPORT", payload.rowNum, "exam_date");
                    payload.startTime = parseTime(getCellByHeader(row, examHeaderMap, "start_time"), response, "EXAMS_IMPORT", payload.rowNum, "start_time");
                    payload.endTime = parseTime(getCellByHeader(row, examHeaderMap, "end_time"), response, "EXAMS_IMPORT", payload.rowNum, "end_time");
                    payload.status = getStringValue(getCellByHeader(row, examHeaderMap, "status"));
                    payload.note = getStringValue(getCellByHeader(row, examHeaderMap, "note"));

                    // Validation Rules
                    if (payload.semesterId == null) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "semester_id", "ERROR", "Thiếu semester_id hoặc định dạng sai");
                        continue;
                    }
                    if (payload.sectionCode == null || payload.roomCode == null || payload.examDate == null || payload.startTime == null || payload.endTime == null) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "required_fields", "ERROR", "Thiếu thông tin bắt buộc (mã lớp, phòng, ngày, giờ)");
                        continue;
                    }

                    if (semesterIdParam != null && !payload.semesterId.equals(semesterIdParam)) {
                         addError(response, "EXAMS_IMPORT", payload.rowNum, "semester_id", "WARNING", "semester_id không khớp với học kỳ đang chọn");
                    }
                    Semester sem = semCache.get(payload.semesterId);
                    if (sem == null) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "semester_id", "ERROR", "semester_id không tồn tại");
                        continue;
                    }
                    if (payload.examDate != null && (payload.examDate.isBefore(sem.getStartDate()) || payload.examDate.isAfter(sem.getEndDate()))) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "exam_date", "ERROR", "Ngày thi nằm ngoài thời gian học kỳ");
                    }
                    
                    if (payload.startTime != null && payload.endTime != null && !payload.startTime.isBefore(payload.endTime)) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "start_time", "ERROR", "Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
                    }

                    CourseSection section = sectionCache.get(payload.sectionCode + "_" + payload.semesterId);
                    if (section == null) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "section_code", "ERROR", "section_code không tồn tại trong học kỳ này");
                        continue;
                    }
                    payload.sectionId = section.getSectionId();
                    payload.teachingLecturerId = section.getLecturerId();

                    long activeExamsCount = examRepository.countActiveExamsForSection(payload.sectionId, null);
                    if (activeExamsCount > 0) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "section_code", "ERROR", "Lớp học phần này đã có lịch thi. Mỗi lớp học phần chỉ được tạo một lịch thi.");
                    }
                    
                    long excelClashCount = examPayloads.stream().filter(ep -> ep.sectionId != null && ep.sectionId.equals(payload.sectionId)).count();
                    if (excelClashCount > 0) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "section_code", "ERROR", "Lớp học phần này đã xuất hiện trước đó trong file Excel này.");
                    }

                    Integer studentCount = enrollmentRepository.countStudentsForSection(section.getSectionId());
                    if (studentCount == null || studentCount == 0) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "student_count", "ERROR", "Lớp học phần không có sinh viên đăng ký hợp lệ");
                        continue;
                    }
                    payload.studentCount = studentCount;

                    Room room = roomCache.get(payload.roomCode);
                    if (room == null) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "room_code", "ERROR", "room_code không tồn tại");
                        continue;
                    }
                    payload.roomId = room.getRoomId();
                    
                    if (studentCount > room.getCapacity()) {
                        addError(response, "EXAMS_IMPORT", payload.rowNum, "room_code", "ERROR", "Sĩ số (" + studentCount + ") vượt quá sức chứa phòng (" + room.getCapacity() + ")");
                    }
                    
                    // Match invigilators
                    for (InvigilatorPayload ip : invPayloads) {
                        if (Objects.equals(ip.semesterId, payload.semesterId) &&
                            Objects.equals(ip.sectionCode, payload.sectionCode) &&
                            Objects.equals(ip.examDate, payload.examDate) &&
                            Objects.equals(ip.startTime, payload.startTime) &&
                            Objects.equals(ip.roomCode, payload.roomCode)) {
                            
                            Lecturer lec = lecturerCache.get(ip.lecturerCode);
                            if (lec == null) {
                                addError(response, "INVIGILATORS_IMPORT", ip.rowNum, "lecturer_code", "ERROR", "lecturer_code không tồn tại: " + ip.lecturerCode);
                                continue;
                            }
                            if (lec.getLecturerId().equals(payload.teachingLecturerId)) {
                                addError(response, "INVIGILATORS_IMPORT", ip.rowNum, "lecturer_code", "ERROR", "Giảng viên không được coi thi lớp mình dạy: " + ip.lecturerCode);
                                continue;
                            }
                            ip.lecturerId = lec.getLecturerId();
                            payload.matchedInvigilators.add(ip);
                        }
                    }
                    
                    if ("SCHEDULED".equalsIgnoreCase(payload.status)) {
                        boolean hasMain = payload.matchedInvigilators.stream().anyMatch(ip -> "MAIN".equalsIgnoreCase(ip.role));
                        if (!hasMain) {
                            addError(response, "EXAMS_IMPORT", payload.rowNum, "status", "ERROR", "Lịch SCHEDULED cần có ít nhất 1 giám thị MAIN");
                        }
                    }
                    
                    // Clash validation
                    if (payload.examDate != null && payload.startTime != null && payload.endTime != null && payload.roomId != null) {
                        List<Exam> existingClashes = examRepository.findOverlappingRoomExams(payload.roomId, payload.examDate, payload.startTime, payload.endTime, null);
                        if (!existingClashes.isEmpty()) {
                            addError(response, "EXAMS_IMPORT", payload.rowNum, "time/room", "ERROR", "Trùng lịch phòng thi trong hệ thống");
                        }
                        
                        long clashWithin = examPayloads.stream().filter(ep -> 
                            ep.roomId != null && ep.roomId.equals(payload.roomId) &&
                            ep.examDate != null && ep.examDate.equals(payload.examDate) &&
                            !(ep.startTime.isAfter(payload.endTime) || ep.startTime.equals(payload.endTime) || ep.endTime.isBefore(payload.startTime) || ep.endTime.equals(payload.startTime))
                        ).count();
                        if (clashWithin > 0) {
                            addError(response, "EXAMS_IMPORT", payload.rowNum, "time/room", "ERROR", "Trùng lịch phòng thi ngay trong file Excel");
                        }
                    }
                    
                    // Prepared item
                    ExcelPreviewResponse.ExcelPreviewItem previewItem = ExcelPreviewResponse.ExcelPreviewItem.builder()
                        .sectionCode(payload.sectionCode)
                        .courseCode("TBD")
                        .courseName("TBD")
                        .roomCode(payload.roomCode)
                        .examDate(payload.examDate)
                        .startTime(payload.startTime)
                        .endTime(payload.endTime)
                        .studentCount(payload.studentCount)
                        .status(payload.status != null && !payload.status.isEmpty() ? payload.status : "DRAFT")
                        .build();
                    response.getPreviewItems().add(previewItem);
                    
                    examPayloads.add(payload);
                    
                } catch (Exception e) {
                    addError(response, "EXAMS_IMPORT", payload.rowNum, "various", "ERROR", "Lỗi dữ liệu hệ thống: " + e.getMessage());
                }
            }
            
            long errCount = response.getErrors().stream().filter(e -> "ERROR".equals(e.getSeverity())).count();
            response.setErrorCount((int) errCount);
            response.setWarningCount(response.getErrors().size() - (int) errCount);
            response.setValidRows(examPayloads.size());
            response.setSuccess(errCount == 0 && !examPayloads.isEmpty());
            
            if (isConfirm) {
                if (errCount > 0) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "File có lỗi (ERROR). Vui lòng sửa lỗi trước khi Import.");
                }
                
                for (ExamPayload ep : examPayloads) {
                    Long mainLecturerId = null;
                    for (InvigilatorPayload ip : ep.matchedInvigilators) {
                        if ("MAIN".equalsIgnoreCase(ip.role)) {
                            mainLecturerId = ip.lecturerId;
                            break;
                        }
                    }
                    
                    Exam exam = Exam.builder()
                        .semesterId(ep.semesterId)
                        .sectionId(ep.sectionId)
                        .roomId(ep.roomId)
                        .proctorLecturerId(mainLecturerId)
                        .examType(ep.examType != null && !ep.examType.isEmpty() ? ep.examType : "midterm")
                        .examMethod(ep.examMethod != null && !ep.examMethod.isEmpty() ? ep.examMethod : "WRITTEN")
                        .examDate(ep.examDate)
                        .startTime(ep.startTime)
                        .endTime(ep.endTime)
                        .studentCount(ep.studentCount)
                        .seatRange(null)
                        .status(ep.status != null && !ep.status.isEmpty() ? ep.status : "DRAFT")
                        .note(ep.note)
                        .build();
                        
                    Exam saved = examRepository.save(exam);
                    
                    for (InvigilatorPayload ip : ep.matchedInvigilators) {
                        ExamInvigilator eInv = ExamInvigilator.builder()
                            .examId(saved.getExamId())
                            .lecturerId(ip.lecturerId)
                            .role(ip.role != null && !ip.role.isEmpty() ? ip.role : "ASSISTANT")
                            .note(ip.note)
                            .build();
                        examInvigilatorRepository.save(eInv);
                    }
                }
            }

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            addError(response, "FILE", 0, "system", "ERROR", "Lỗi không xác định khi đọc Excel: " + e.getMessage());
            response.setSuccess(false);
            return response;
        }
    }
    
    private Map<String, Integer> buildHeaderMap(Sheet sheet) {
        Map<String, Integer> map = new HashMap<>();
        if (sheet == null) return map;
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) return map;
        for (int i = headerRow.getFirstCellNum(); i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null && cell.getCellType() == CellType.STRING) {
                String val = cell.getStringCellValue().trim().toLowerCase();
                map.put(val, i);
            }
        }
        return map;
    }
    
    private Cell getCellByHeader(Row row, Map<String, Integer> headerMap, String header) {
        Integer idx = headerMap.get(header.toLowerCase());
        if (idx == null) return null;
        return row.getCell(idx);
    }

    private void addError(ExcelPreviewResponse res, String sheet, int row, String field, String severity, String msg) {
        res.getErrors().add(new ExcelPreviewResponse.ExcelErrorItem(sheet, row, field, severity, msg));
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private String getStringValue(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue().trim();
            if (cell.getCellType() == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) return null; // Not meant for strings
                double val = cell.getNumericCellValue();
                if (val == (long) val) return String.valueOf((long) val);
                return String.valueOf(val);
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    private Long getLongValue(Cell cell, ExcelPreviewResponse res, String sheet, int rowNum, String field) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return (long) cell.getNumericCellValue();
            if (cell.getCellType() == CellType.STRING) {
                String str = cell.getStringCellValue().trim();
                if (str.isEmpty()) return null;
                return Long.parseLong(str);
            }
        } catch (NumberFormatException e) {
            addError(res, sheet, rowNum, field, "ERROR", "Định dạng số không hợp lệ");
        } catch (Exception e) {
            addError(res, sheet, rowNum, field, "ERROR", "Lỗi đọc số: " + e.getMessage());
        }
        return null;
    }

    private LocalDate parseDate(Cell cell, ExcelPreviewResponse res, String sheet, int rowNum, String field) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate();
                } else {
                    return DateUtil.getLocalDateTime(cell.getNumericCellValue()).toLocalDate();
                }
            } else if (cell.getCellType() == CellType.STRING) {
                String str = cell.getStringCellValue().trim();
                if (str.isEmpty()) return null;
                return LocalDate.parse(str, DATE_FORMATTER);
            }
        } catch (DateTimeParseException e) {
            addError(res, sheet, rowNum, field, "ERROR", "Sai định dạng ngày (yyyy-MM-dd)");
        } catch (Exception e) {
            addError(res, sheet, rowNum, field, "ERROR", "Không thể đọc giá trị ngày");
        }
        return null;
    }

    private LocalTime parseTime(Cell cell, ExcelPreviewResponse res, String sheet, int rowNum, String field) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalTime();
                } else {
                    // Excel time fractions like 0.3333 for 08:00
                    double val = cell.getNumericCellValue();
                    if (val >= 0 && val < 1) {
                        return DateUtil.getLocalDateTime(val).toLocalTime();
                    } else {
                        return DateUtil.getLocalDateTime(val).toLocalTime();
                    }
                }
            } else if (cell.getCellType() == CellType.STRING) {
                String str = cell.getStringCellValue().trim();
                if (str.isEmpty()) return null;
                return LocalTime.parse(str, TIME_FORMATTER);
            }
        } catch (DateTimeParseException e) {
            addError(res, sheet, rowNum, field, "ERROR", "Sai định dạng giờ (HH:mm)");
        } catch (Exception e) {
            addError(res, sheet, rowNum, field, "ERROR", "Không thể đọc giá trị giờ");
        }
        return null;
    }

    private static class ExamPayload {
        int rowNum;
        String action;
        Long semesterId;
        String sectionCode;
        Long sectionId;
        Long teachingLecturerId;
        String roomCode;
        Long roomId;
        String examType;
        String examMethod;
        LocalDate examDate;
        LocalTime startTime;
        LocalTime endTime;
        Integer studentCount;
        String status;
        String note;
        List<InvigilatorPayload> matchedInvigilators = new ArrayList<>();
    }

    private static class InvigilatorPayload {
        Long semesterId;
        String sectionCode;
        LocalDate examDate;
        LocalTime startTime;
        String roomCode;
        String lecturerCode;
        Long lecturerId;
        String role;
        String note;
        int rowNum;
        
        public InvigilatorPayload(Long semId, String sc, LocalDate ed, LocalTime st, String rc, String lc, String role, String note, int rowNum) {
            this.semesterId = semId;
            this.sectionCode = sc;
            this.examDate = ed;
            this.startTime = st;
            this.roomCode = rc;
            this.lecturerCode = lc;
            this.role = role;
            this.note = note;
            this.rowNum = rowNum;
        }
    }
}
