package com.uniteddistributors.backend.service;

import com.uniteddistributors.backend.dto.CheckoutRequest;
import com.uniteddistributors.backend.exception.ApiException;
import com.uniteddistributors.backend.model.*;
import com.uniteddistributors.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    public CustomerOrder checkout(
            String email,
            CheckoutRequest request
    ) {
        User customer = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Customer not found"
                        )
                );

        Cart cart = cartService.getOrCreateUserCart(email);

        if (cart.getItems().isEmpty()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Your cart is empty"
            );
        }

        CustomerOrder order = CustomerOrder.builder()
                .orderCode(generateOrderCode())
                .customer(customer)
                .deliveryName(request.deliveryName())
                .deliveryMobile(request.mobile())
                .deliveryAddress(request.address())
                .postalCode(request.postalCode())
                .status(OrderStatus.SUCCESS)
                .total(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository
                    .findById(cartItem.getProduct().getId())
                    .orElseThrow(() ->
                            new ApiException(
                                    HttpStatus.NOT_FOUND,
                                    "A cart product no longer exists"
                            )
                    );

            if (!product.isActive()) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        product.getName() + " is unavailable"
                );
            }

            if (product.getStock() < cartItem.getQuantity()) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for "
                                + product.getName()
                );
            }

            BigDecimal subtotal =
                    product.getPrice().multiply(
                            BigDecimal.valueOf(
                                    cartItem.getQuantity()
                            )
                    );

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productCode(product.getCode())
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(cartItem.getQuantity())
                    .subtotal(subtotal)
                    .build();

            order.getItems().add(orderItem);
            total = total.add(subtotal);

            product.setStock(
                    product.getStock() - cartItem.getQuantity()
            );

            productRepository.save(product);
        }

        order.setTotal(total);

        CustomerOrder savedOrder =
                orderRepository.save(order);

        cart.getItems().clear();

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<CustomerOrder> getCustomerOrders(
            String email
    ) {
        User customer = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Customer not found"
                        )
                );

        return orderRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    @Transactional(readOnly = true)
    public List<CustomerOrder> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public CustomerOrder updateStatus(
            Long orderId,
            OrderStatus status
    ) {
        CustomerOrder order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new ApiException(
                                        HttpStatus.NOT_FOUND,
                                        "Order not found"
                                )
                        );

        order.setStatus(status);

        return orderRepository.save(order);
    }

    private String generateOrderCode() {
        String date = LocalDate.now()
                .format(DateTimeFormatter.BASIC_ISO_DATE);

        String randomPart = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 6)
                .toUpperCase();

        return "UD-" + date + "-" + randomPart;
    }
}