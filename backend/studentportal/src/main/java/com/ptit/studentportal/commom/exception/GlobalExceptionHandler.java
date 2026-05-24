package com.ptit.studentportal.commom.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.commom.response.ValidationErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(AppException.class)
	public ResponseEntity<ApiResponse<Object>> handleAppException(AppException exception) {
		return ResponseEntity.status(exception.getStatus())
				.body(ApiResponse.error(exception.getMessage()));
	}

	@ExceptionHandler(StructuredApiException.class)
	public ResponseEntity<java.util.Map<String, Object>> handleStructuredApiException(StructuredApiException exception) {
		return ResponseEntity.status(exception.getStatus())
				.body(exception.getBody());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error(exception.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<List<ValidationErrorResponse>>> handleValidation(MethodArgumentNotValidException exception) {
		List<ValidationErrorResponse> errors = exception.getBindingResult().getFieldErrors().stream()
				.map(this::toError)
				.collect(Collectors.toList());
		return ResponseEntity.badRequest()
				.body(new ApiResponse<>(false, "Validation failed", errors, java.time.LocalDateTime.now()));
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiResponse<Object>> handleMaxUpload(MaxUploadSizeExceededException exception) {
		return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
				.body(ApiResponse.error("Uploaded file is too large"));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<Void>> handleUnreadableJson(HttpMessageNotReadableException ex) {
		log.warn("Invalid or unreadable HTTP message body: {}", ex.getMostSpecificCause().getMessage());
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error(
						"JSON không hợp lệ hoặc sai định dạng. Trong Postman: Body → raw → JSON, "
								+ "gửi đúng {\"username\":\"...\",\"password\":\"...\"}, "
								+ "Header Content-Type: application/json."));
	}

	@ExceptionHandler(DataAccessException.class)
	public ResponseEntity<ApiResponse<Void>> handleDataAccess(DataAccessException ex) {
		log.error("Database error", ex);
		return ResponseEntity
				.status(HttpStatus.SERVICE_UNAVAILABLE)
				.body(ApiResponse.error(
						"Không thể truy cập cơ sở dữ liệu. Hãy kiểm tra MySQL đang chạy và "
								+ "cấu hình spring.datasource.* trong application.properties."));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception exception) {
		log.error("Unhandled exception (login and other APIs): {}", exception.getMessage(), exception);
		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponse.error(exception.getMessage() == null ? "Unexpected server error" : exception.getMessage()));
	}

	private ValidationErrorResponse toError(FieldError fieldError) {
		return new ValidationErrorResponse(fieldError.getField(), fieldError.getDefaultMessage());
	}
}
