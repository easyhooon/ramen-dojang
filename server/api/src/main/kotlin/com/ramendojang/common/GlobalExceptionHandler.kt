package com.ramendojang.common

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(ApiException::class)
    fun handleApiException(exception: ApiException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(exception.status).body(
            ErrorResponse(code = exception.code, message = exception.message),
        )

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(exception: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val message = exception.bindingResult.fieldErrors.firstOrNull()?.defaultMessage
            ?: "Request value is invalid."

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponse(code = "VALIDATION_ERROR", message = message),
        )
    }
}

