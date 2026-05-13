package com.ptit.studentportal.timetable.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.timetable.entity.Building;
import com.ptit.studentportal.timetable.entity.CourseSection;
import com.ptit.studentportal.timetable.entity.Room;
import com.ptit.studentportal.timetable.entity.Semester;
import com.ptit.studentportal.timetable.entity.SemesterWeek;
import com.ptit.studentportal.timetable.entity.TimeSlot;
import com.ptit.studentportal.timetable.repository.BuildingRepository;
import com.ptit.studentportal.timetable.repository.CourseSectionRepository;
import com.ptit.studentportal.timetable.repository.RoomRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.repository.SemesterWeekRepository;
import com.ptit.studentportal.timetable.repository.TimeSlotRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminLookupController {

	private final SemesterRepository semesterRepository;
	private final SemesterWeekRepository semesterWeekRepository;
	private final CourseSectionRepository courseSectionRepository;
	private final RoomRepository roomRepository;
	private final BuildingRepository buildingRepository;
	private final TimeSlotRepository timeSlotRepository;

	public AdminLookupController(
			SemesterRepository semesterRepository,
			SemesterWeekRepository semesterWeekRepository,
			CourseSectionRepository courseSectionRepository,
			RoomRepository roomRepository,
			BuildingRepository buildingRepository,
			TimeSlotRepository timeSlotRepository
	) {
		this.semesterRepository = semesterRepository;
		this.semesterWeekRepository = semesterWeekRepository;
		this.courseSectionRepository = courseSectionRepository;
		this.roomRepository = roomRepository;
		this.buildingRepository = buildingRepository;
		this.timeSlotRepository = timeSlotRepository;
	}

	@GetMapping("/semesters")
	public ResponseEntity<ApiResponse<List<Semester>>> getSemesters() {
		return ResponseEntity.ok(ApiResponse.success("Semesters loaded", semesterRepository.findAll()));
	}

	@GetMapping("/semester-weeks")
	public ResponseEntity<ApiResponse<List<SemesterWeek>>> getSemesterWeeks(@RequestParam Long semesterId) {
		return ResponseEntity.ok(ApiResponse.success(
				"Semester weeks loaded",
				semesterWeekRepository.findBySemesterIdOrderByWeekNo(semesterId)
		));
	}

	@GetMapping("/course-sections")
	public ResponseEntity<ApiResponse<List<CourseSection>>> getCourseSections(@RequestParam Long semesterId) {
		return ResponseEntity.ok(ApiResponse.success(
				"Course sections loaded",
				courseSectionRepository.findBySemesterId(semesterId)
		));
	}

	@GetMapping("/rooms")
	public ResponseEntity<ApiResponse<List<Room>>> getRooms() {
		return ResponseEntity.ok(ApiResponse.success("Rooms loaded", roomRepository.findAll()));
	}

	@GetMapping("/buildings")
	public ResponseEntity<ApiResponse<List<Building>>> getBuildings() {
		return ResponseEntity.ok(ApiResponse.success("Buildings loaded", buildingRepository.findAll()));
	}

	@GetMapping("/time-slots")
	public ResponseEntity<ApiResponse<List<TimeSlot>>> getTimeSlots() {
		List<TimeSlot> slots = timeSlotRepository.findAll().stream()
				.filter(slot -> slot.getSlotNo() != null && slot.getSlotNo() <= 12)
				.toList();
		return ResponseEntity.ok(ApiResponse.success("Time slots loaded", slots));
	}
}

