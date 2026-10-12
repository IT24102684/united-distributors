package com.uniteddistributors.backend.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(

        @NotBlank
        @Size(min = 2, max = 100)
        String fullName,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        @NotBlank
        @Size(min = 9, max = 20)
        String mobile,

        String guestToken
) {
}