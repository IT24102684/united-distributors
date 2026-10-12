package com.uniteddistributors.backend.dto;

public record AuthResponse(
        String token,
        Long id,
        String fullName,
        String email,
        String mobile,
        String role
) {
}