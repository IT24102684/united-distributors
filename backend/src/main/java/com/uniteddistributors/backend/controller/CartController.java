package com.uniteddistributors.backend.controller;

import com.uniteddistributors.backend.dto.CartRequest;
import com.uniteddistributors.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /*
     * GUEST CART
     */

    @GetMapping("/guest/{guestToken}")
    public Map<String, Object> getGuestCart(
            @PathVariable String guestToken
    ) {
        return cartService.getGuestCart(guestToken);
    }

    @PostMapping("/guest/{guestToken}/items")
    public Map<String, Object> addGuestItem(
            @PathVariable String guestToken,
            @Valid @RequestBody CartRequest request
    ) {
        return cartService.addToGuestCart(
                guestToken,
                request.productId(),
                request.quantity()
        );
    }

    @PutMapping("/guest/{guestToken}/items")
    public Map<String, Object> updateGuestItem(
            @PathVariable String guestToken,
            @Valid @RequestBody CartRequest request
    ) {
        return cartService.updateGuestItem(
                guestToken,
                request.productId(),
                request.quantity()
        );
    }

    @DeleteMapping(
            "/guest/{guestToken}/items/{productId}"
    )
    public Map<String, Object> removeGuestItem(
            @PathVariable String guestToken,
            @PathVariable Long productId
    ) {
        return cartService.removeGuestItem(
                guestToken,
                productId
        );
    }

    /*
     * LOGGED-IN CUSTOMER CART
     */

    @GetMapping
    public Map<String, Object> getUserCart(
            Authentication authentication
    ) {
        return cartService.getUserCart(
                authentication.getName()
        );
    }

    @PostMapping("/items")
    public Map<String, Object> addUserItem(
            Authentication authentication,
            @Valid @RequestBody CartRequest request
    ) {
        return cartService.addToUserCart(
                authentication.getName(),
                request.productId(),
                request.quantity()
        );
    }

    @PutMapping("/items")
    public Map<String, Object> updateUserItem(
            Authentication authentication,
            @Valid @RequestBody CartRequest request
    ) {
        return cartService.updateUserItem(
                authentication.getName(),
                request.productId(),
                request.quantity()
        );
    }

    @DeleteMapping("/items/{productId}")
    public Map<String, Object> removeUserItem(
            Authentication authentication,
            @PathVariable Long productId
    ) {
        return cartService.removeUserItem(
                authentication.getName(),
                productId
        );
    }
}