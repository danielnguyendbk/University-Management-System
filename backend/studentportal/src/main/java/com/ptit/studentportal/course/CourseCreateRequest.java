package com.ptit.studentportal.course;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CourseCreateRequest(
		@NotBlank(message = "Mã môn học không được để trống")
		@Size(max = 20, message = "Mã môn học tối đa 20 ký tự")
		String courseCode,

		@NotBlank(message = "Tên môn học không được để trống")
		@Size(max = 150, message = "Tên môn học tối đa 150 ký tự")
		String courseName,

		@Min(value = 1, message = "Số tín chỉ phải lớn hơn 0")
		int credits,

		@NotNull(message = "Loại môn học không được để trống")
		String courseType,

		String description
) {
}
