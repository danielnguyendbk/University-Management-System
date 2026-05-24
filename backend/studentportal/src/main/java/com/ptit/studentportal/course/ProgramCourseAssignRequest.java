package com.ptit.studentportal.course;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

public record ProgramCourseAssignRequest(
		@NotNull(message = "Mã môn học không được để trống")
		Long courseId,

		@Min(value = 1, message = "Học kỳ gợi ý phải lớn hơn 0")
		@Max(value = 10, message = "Học kỳ gợi ý phải nhỏ hơn hoặc bằng 10")
		Integer recommendedSemester,

		boolean isRequired
) {
}
