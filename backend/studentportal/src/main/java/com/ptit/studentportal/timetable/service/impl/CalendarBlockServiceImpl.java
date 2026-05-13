package com.ptit.studentportal.timetable.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ptit.studentportal.timetable.dto.request.CreateCalendarBlockRequest;
import com.ptit.studentportal.timetable.entity.AcademicCalendarBlock;
import com.ptit.studentportal.timetable.repository.CalendarBlockRepository;
import com.ptit.studentportal.timetable.repository.SemesterRepository;
import com.ptit.studentportal.timetable.service.CalendarBlockService;

@Service
@Transactional
public class CalendarBlockServiceImpl implements CalendarBlockService {

	private final CalendarBlockRepository calendarBlockRepository;
	private final SemesterRepository semesterRepository;

	public CalendarBlockServiceImpl(
			CalendarBlockRepository calendarBlockRepository,
			SemesterRepository semesterRepository
	) {
		this.calendarBlockRepository = calendarBlockRepository;
		this.semesterRepository = semesterRepository;
	}

	@Override
	public AcademicCalendarBlock create(CreateCalendarBlockRequest request) {
		validate(request);
		AcademicCalendarBlock block = AcademicCalendarBlock.builder()
				.semesterId(request.semesterId())
				.startDate(request.startDate())
				.endDate(request.endDate())
				.blockType(request.blockType())
				.title(request.title())
				.teachingAllowed(request.teachingAllowed())
				.note(request.note())
				.build();
		return calendarBlockRepository.save(block);
	}

	@Override
	@Transactional(readOnly = true)
	public List<AcademicCalendarBlock> getBySemester(Long semesterId) {
		semesterRepository.findById(semesterId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc ky."));
		return calendarBlockRepository.findBySemesterId(semesterId);
	}

	@Override
	public AcademicCalendarBlock update(Long blockId, CreateCalendarBlockRequest request) {
		validate(request);
		AcademicCalendarBlock block = calendarBlockRepository.findById(blockId)
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay khoang nghi."));
		block.setSemesterId(request.semesterId());
		block.setStartDate(request.startDate());
		block.setEndDate(request.endDate());
		block.setBlockType(request.blockType());
		block.setTitle(request.title());
		block.setTeachingAllowed(request.teachingAllowed());
		block.setNote(request.note());
		return calendarBlockRepository.save(block);
	}

	@Override
	public void delete(Long blockId) {
		if (!calendarBlockRepository.existsById(blockId)) {
			throw new IllegalArgumentException("Khong tim thay khoang nghi.");
		}
		calendarBlockRepository.deleteById(blockId);
	}

	private void validate(CreateCalendarBlockRequest request) {
		semesterRepository.findById(request.semesterId())
				.orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoc ky."));
		if (request.endDate().isBefore(request.startDate())) {
			throw new IllegalArgumentException("Ngay ket thuc phai lon hon hoac bang ngay bat dau.");
		}
		if (request.title() == null || request.title().isBlank()) {
			throw new IllegalArgumentException("Tieu de khong duoc de trong.");
		}
	}
}

