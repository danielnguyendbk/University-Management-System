package com.ptit.studentportal.timetable.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.lecturer.LecturerRepository;
import com.ptit.studentportal.timetable.dto.response.BuildingOptionResponse;
import com.ptit.studentportal.timetable.dto.response.RoomOptionResponse;
import com.ptit.studentportal.timetable.dto.response.SectionOptionResponse;
import com.ptit.studentportal.timetable.dto.response.SemesterOptionResponse;
import com.ptit.studentportal.timetable.dto.response.SemesterWeekResponse;
import com.ptit.studentportal.timetable.dto.response.TimeSlotResponse;
import com.ptit.studentportal.timetable.repository.BuildingRepository;
import com.ptit.studentportal.timetable.repository.CourseRepository;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.RoomRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.repository.SemesterWeekRepository;
import com.ptit.studentportal.timetable.repository.TimeSlotRepository;

@RestController
@RequestMapping("/api/admin/timetable")
public class AdminLookupController {

    private final SemesterRepository semesterRepository;
    private final SemesterWeekRepository semesterWeekRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;

    public AdminLookupController(
            SemesterRepository semesterRepository,
            SemesterWeekRepository semesterWeekRepository,
            CourseSectionRepository courseSectionRepository,
            RoomRepository roomRepository,
            BuildingRepository buildingRepository,
            TimeSlotRepository timeSlotRepository,
            CourseRepository courseRepository,
            LecturerRepository lecturerRepository
    ) {
        this.semesterRepository = semesterRepository;
        this.semesterWeekRepository = semesterWeekRepository;
        this.courseSectionRepository = courseSectionRepository;
        this.roomRepository = roomRepository;
        this.buildingRepository = buildingRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.courseRepository = courseRepository;
        this.lecturerRepository = lecturerRepository;
    }

    @GetMapping("/semesters")
    public ResponseEntity<ApiResponse<List<SemesterOptionResponse>>> getSemesters() {
        List<SemesterOptionResponse> response = semesterRepository.findAll().stream()
                .sorted((a, b) -> a.getSemesterId().compareTo(b.getSemesterId()))
                .map(s -> new SemesterOptionResponse(
                        s.getSemesterId(),
                        s.getSemesterCode(),
                        s.getSemesterName(),
                        (s.getAcademicYear() != null && !s.getAcademicYear().trim().isEmpty())
                                ? s.getAcademicYear()
                                : s.getSemesterYear(),
                        s.getStatus() != null ? s.getStatus().name() : null,
                        s.getTimetableStatus() != null ? s.getTimetableStatus().name() : null
                ))
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Semesters loaded", response));
    }

    @GetMapping("/semesters/{semesterId}/weeks")
    public ResponseEntity<ApiResponse<List<SemesterWeekResponse>>> getSemesterWeeks(
            @PathVariable Long semesterId
    ) {
        List<SemesterWeekResponse> response = semesterWeekRepository.findBySemesterIdOrderByWeekNo(semesterId).stream()
                .map(w -> new SemesterWeekResponse(
                        w.getSemesterWeekId(), w.getWeekNo(), w.getStartDate(), w.getEndDate(),
                        w.getBreakWeek(), w.getWeekType(), w.getStatus()
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Semester weeks loaded", response));
    }

    @GetMapping("/semesters/{semesterId}/sections")
    public ResponseEntity<ApiResponse<List<SectionOptionResponse>>> getCourseSections(
            @PathVariable Long semesterId
    ) {
        List<SectionOptionResponse> response = courseSectionRepository.findBySemesterId(semesterId).stream()
                .map(sec -> {
                    var course = (sec.getCourseId() != null) ? courseRepository.findById(sec.getCourseId()).orElse(null) : null;
                    var lecturer = (sec.getLecturerId() != null) ? lecturerRepository.findById(sec.getLecturerId()).orElse(null) : null;
                    return new SectionOptionResponse(
                            sec.getSectionId(),
                            sec.getSectionCode(),
                            course != null ? course.getCourseCode() : null,
                            course != null ? course.getCourseName() : null,
                            lecturer != null ? lecturer.getLecturerId() : null,
                            lecturer != null ? lecturer.getLecturerCode() : null,
                            lecturer != null ? lecturer.getFullName() : null
                    );
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Course sections loaded", response));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomOptionResponse>>> getRooms() {
        List<RoomOptionResponse> response = roomRepository.findAll().stream()
                .map(r -> {
                    var building = (r.getBuildingId() != null) ? buildingRepository.findById(r.getBuildingId()).orElse(null) : null;
                    return new RoomOptionResponse(
                            r.getRoomId(), r.getRoomCode(),
                            building != null ? building.getBuildingCode() : null,
                            building != null ? building.getBuildingName() : null,
                            r.getRoomType(), r.getCapacity()
                    );
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Rooms loaded", response));
    }

    @GetMapping("/buildings")
    public ResponseEntity<ApiResponse<List<BuildingOptionResponse>>> getBuildings() {
        List<BuildingOptionResponse> response = buildingRepository.findAll().stream()
                .map(b -> new BuildingOptionResponse(
                        b.getBuildingId(), b.getBuildingCode(), b.getBuildingName()
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Buildings loaded", response));
    }

    @GetMapping("/time-slots")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getTimeSlots() {
        List<TimeSlotResponse> slots = timeSlotRepository.findAllByOrderBySlotNoAsc().stream()
                .map(slot -> new TimeSlotResponse(
                        slot.getSlotNo(),
                        slot.getSlotLabel(),
                        slot.getStartTime(),
                        slot.getEndTime()
                ))
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Time slots loaded", slots));
    }
}