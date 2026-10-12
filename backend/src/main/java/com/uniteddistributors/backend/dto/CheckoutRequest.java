package com.uniteddistributors.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(

        @NotBlank
        @Size(max = 100)
        String deliveryName,

        @NotBlank
        @Size(max = 20)
        String mobile,

        @NotBlank
        String address,

        @NotBlank
        @Size(max = 20)
        String postalCode
) {
}