package com.uniteddistributors.backend.controller;

import com.uniteddistributors.backend.dto.CheckoutRequest;
import com.uniteddistributors.backend.model.CustomerOrder;
import com.uniteddistributors.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public CustomerOrder checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequest request
    ) {
        return orderService.checkout(
                authentication.getName(),
                request
        );
    }

    @GetMapping("/my-orders")
    public List<CustomerOrder> getMyOrders(
            Authentication authentication
    ) {
        return orderService.getCustomerOrders(
                authentication.getName()
        );
    }
}