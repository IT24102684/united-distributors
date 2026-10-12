package com.uniteddistributors.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartRequest(

        @NotNull
        Long productId,

        @NotNull
        @Min(1)
        Integer quantity
) {
}