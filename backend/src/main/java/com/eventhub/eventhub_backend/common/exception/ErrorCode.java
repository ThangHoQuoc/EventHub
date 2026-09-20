package com.eventhub.eventhub_backend.common.exception;


import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    SUCCESS(1000, "Success", HttpStatus.OK),

    USER_EXISTED(1001, "User already exists", HttpStatus.CONFLICT),

    USER_NOT_FOUND(1002, "User not found", HttpStatus.NOT_FOUND),

    INVALID_PASSWORD(1003, "Invalid password", HttpStatus.UNAUTHORIZED),

    UNAUTHENTICATED(1004, "Unauthenticated", HttpStatus.UNAUTHORIZED),

    UNAUTHORIZED(1005, "You do not have permission", HttpStatus.FORBIDDEN),

    INVALID_REQUEST(1006, "Invalid request", HttpStatus.BAD_REQUEST),

    VALIDATION_ERROR(1007, "Validation failed", HttpStatus.BAD_REQUEST),

    RESOURCE_NOT_FOUND(1008, "Resource not found", HttpStatus.NOT_FOUND),

    METHOD_NOT_ALLOWED(1009, "HTTP method not allowed", HttpStatus.METHOD_NOT_ALLOWED),

    EVENT_NOT_FOUND(1010, "Event not found", HttpStatus.NOT_FOUND),

    EVENT_CANNOT_BE_UPDATED(1011, "Event cannot be updated in its current status", HttpStatus.BAD_REQUEST),

    TICKET_TYPE_ALREADY_EXIST(1012, "Ticket type already exists", HttpStatus.CONFLICT),

    TICKET_TYPE_NOT_FOUND(1013,"Ticket type not found",HttpStatus.NOT_FOUND),

    BOOKING_NOT_FOUND(1014, "Booking not found", HttpStatus.NOT_FOUND),

    TICKET_NOT_FOUND(1015, "Ticket not found", HttpStatus.NOT_FOUND),

    INTERNAL_SERVER_ERROR(9999, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);


    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
