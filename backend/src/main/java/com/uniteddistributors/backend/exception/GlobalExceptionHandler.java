package com.uniteddistributors.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * අපි manually throw කරන ApiException errors
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>>
    handleApiException(ApiException exception) {

        return ResponseEntity
                .status(exception.getStatus())
                .body(errorBody(
                        exception.getStatus().value(),
                        exception.getMessage(),
                        exception.getClass().getSimpleName()
                ));
    }

    /*
     * Form validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>>
    handleValidation(
            MethodArgumentNotValidException exception
    ) {
        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        validationErrors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> response = errorBody(
                400,
                "Please check the submitted information",
                exception.getClass().getSimpleName()
        );

        response.put(
                "validationErrors",
                validationErrors
        );

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    /*
     * Permission errors
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>>
    handleAccessDenied(
            AccessDeniedException exception
    ) {
        return ResponseEntity
                .status(403)
                .body(errorBody(
                        403,
                        "You do not have permission",
                        exception.getClass().getSimpleName()
                ));
    }

    /*
     * Development කාලයේ unexpected error එකේ
     * සැබෑ message එක frontend එකට යවනවා.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>>
    handleOtherErrors(Exception exception) {

        exception.printStackTrace();

        String actualMessage = exception.getMessage();

        if (actualMessage == null ||
                actualMessage.isBlank()) {
            actualMessage =
                    "Unknown backend error: "
                            + exception.getClass()
                            .getSimpleName();
        }

        return ResponseEntity
                .internalServerError()
                .body(errorBody(
                        500,
                        actualMessage,
                        exception.getClass().getName()
                ));
    }

    private Map<String, Object> errorBody(
            int status,
            String message,
            String errorType
    ) {
        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "timestamp",
                LocalDateTime.now()
        );

        response.put("status", status);
        response.put("errorType", errorType);
        response.put("message", message);

        return response;
    }
}