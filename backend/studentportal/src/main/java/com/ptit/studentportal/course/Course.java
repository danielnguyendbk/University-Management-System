package com.ptit.studentportal.course;

import java.time.LocalDateTime;
import java.util.Locale;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "CatalogCourse")
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

	public enum CourseType {
		BAT_BUOC_CHUNG("bắt buộc chung"),
		BAT_BUOC_CHUNG_NHOM_NGANH("bắt buộc chung nhóm ngành"),
		CO_SO_NGANH("cơ sở ngành"),
		CHUYEN_NGANH("chuyên ngành"),
		THUC_TAP("thực tập"),
		LUAN_VAN_TOT_NGHIEP("luận văn tốt nghiệp");

		private final String dbValue;

		CourseType(String dbValue) {
			this.dbValue = dbValue;
		}

		@JsonCreator
		public static CourseType fromValue(String value) {
			if (value == null) {
				return null;
			}
			String normalized = value.trim().toLowerCase(Locale.ROOT);
			for (CourseType type : values()) {
				if (type.dbValue.equals(normalized)) {
					return type;
				}
			}
			throw new IllegalArgumentException("Loại môn học không hợp lệ: " + value);
		}

		public String toDbValue() {
			return dbValue;
		}
	}

	@Converter(autoApply = false)
	public static class CourseTypeConverter implements AttributeConverter<CourseType, String> {

		@Override
		public String convertToDatabaseColumn(CourseType attribute) {
			return attribute == null ? null : attribute.toDbValue();
		}

		@Override
		public CourseType convertToEntityAttribute(String dbData) {
			return dbData == null ? null : CourseType.fromValue(dbData);
		}
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "course_id")
	private Long courseId;

	@Column(name = "course_code", nullable = false, unique = true, length = 20)
	private String courseCode;

	@Column(name = "course_name", nullable = false, length = 150)
	private String courseName;

	@Column(name = "credits", nullable = false)
	private Integer credits;

	@Convert(converter = CourseTypeConverter.class)
	@Column(name = "course_type", nullable = false, length = 50)
	@Builder.Default
	private CourseType courseType = CourseType.BAT_BUOC_CHUNG;

	@Builder.Default
	@Column(name = "is_active", nullable = false)
	private Boolean isActive = true;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
