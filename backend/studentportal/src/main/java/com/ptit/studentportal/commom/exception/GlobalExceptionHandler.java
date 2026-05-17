package com.ptit.studentportal.commom.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.ptit.studentportal.commom.response.ApiResponse;
import com.ptit.studentportal.commom.response.ValidationErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(AppException.class)
	public ResponseEntity<ApiResponse<Object>> handleAppException(AppException exception) {
		return ResponseEntity.status(exception.getStatus())
				.body(ApiResponse.error(exception.getMessage()));
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

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception exception) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponse.error(exception.getMessage() == null ? "Unexpected server error" : exception.getMessage()));
	}

	private ValidationErrorResponse toError(FieldError fieldError) {
		return new ValidationErrorResponse(fieldError.getField(), fieldError.getDefaultMessage());
	}
}
