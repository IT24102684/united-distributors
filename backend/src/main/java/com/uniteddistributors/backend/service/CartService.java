package com.uniteddistributors.backend.service;

import com.uniteddistributors.backend.exception.ApiException;
import com.uniteddistributors.backend.model.*;
import com.uniteddistributors.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getGuestCart(String guestToken) {
        return cartResponse(getOrCreateGuestCart(guestToken));
    }

    public Map<String, Object> getUserCart(String email) {
        return cartResponse(getOrCreateUserCart(email));
    }

    public Map<String, Object> addToGuestCart(
            String guestToken,
            Long productId,
            Integer quantity
    ) {
        Cart cart = getOrCreateGuestCart(guestToken);
        addItem(cart, productId, quantity);
        return cartResponse(cart);
    }

    public Map<String, Object> addToUserCart(
            String email,
            Long productId,
            Integer quantity
    ) {
        Cart cart = getOrCreateUserCart(email);
        addItem(cart, productId, quantity);
        return cartResponse(cart);
    }

    public Map<String, Object> updateGuestItem(
            String guestToken,
            Long productId,
            Integer quantity
    ) {
        Cart cart = getOrCreateGuestCart(guestToken);
        updateItem(cart, productId, quantity);
        return cartResponse(cart);
    }

    public Map<String, Object> updateUserItem(
            String email,
            Long productId,
            Integer quantity
    ) {
        Cart cart = getOrCreateUserCart(email);
        updateItem(cart, productId, quantity);
        return cartResponse(cart);
    }

    public Map<String, Object> removeGuestItem(
            String guestToken,
            Long productId
    ) {
        Cart cart = getOrCreateGuestCart(guestToken);
        removeItem(cart, productId);
        return cartResponse(cart);
    }

    public Map<String, Object> removeUserItem(
            String email,
            Long productId
    ) {
        Cart cart = getOrCreateUserCart(email);
        removeItem(cart, productId);
        return cartResponse(cart);
    }

    public void mergeGuestCart(
            String guestToken,
            User user
    ) {
        if (guestToken == null || guestToken.isBlank()) {
            return;
        }

        Optional<Cart> guestCartOptional =
                cartRepository.findByGuestToken(guestToken);

        if (guestCartOptional.isEmpty()) {
            return;
        }

        Cart guestCart = guestCartOptional.get();

        Cart userCart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .user(user)
                                .items(new ArrayList<>())
                                .build()
                ));

        List<CartItem> guestItems =
                new ArrayList<>(guestCart.getItems());

        for (CartItem guestItem : guestItems) {
            Optional<CartItem> existingItem =
                    cartItemRepository.findByCartIdAndProductId(
                            userCart.getId(),
                            guestItem.getProduct().getId()
                    );

            if (existingItem.isPresent()) {
                CartItem userItem = existingItem.get();

                int quantity =
                        userItem.getQuantity()
                                + guestItem.getQuantity();

                quantity = Math.min(
                        quantity,
                        guestItem.getProduct().getStock()
                );

                userItem.setQuantity(quantity);
                cartItemRepository.save(userItem);
            } else {
                CartItem newItem = CartItem.builder()
                        .cart(userCart)
                        .product(guestItem.getProduct())
                        .quantity(Math.min(
                                guestItem.getQuantity(),
                                guestItem.getProduct().getStock()
                        ))
                        .build();

                cartItemRepository.save(newItem);
            }
        }

        cartRepository.delete(guestCart);
    }

    public Cart getOrCreateUserCart(String email) {
        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() ->
                        cartRepository.save(
                                Cart.builder()
                                        .user(user)
                                        .items(new ArrayList<>())
                                        .build()
                        )
                );
    }

    private Cart getOrCreateGuestCart(String guestToken) {
        if (guestToken == null || guestToken.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Guest cart token is required"
            );
        }

        return cartRepository.findByGuestToken(guestToken)
                .orElseGet(() ->
                        cartRepository.save(
                                Cart.builder()
                                        .guestToken(guestToken)
                                        .items(new ArrayList<>())
                                        .build()
                        )
                );
    }

    private void addItem(
            Cart cart,
            Long productId,
            Integer quantity
    ) {
        Product product = getAvailableProduct(productId);

        Optional<CartItem> existing =
                cartItemRepository.findByCartIdAndProductId(
                        cart.getId(),
                        productId
                );

        int newQuantity = quantity;

        if (existing.isPresent()) {
            newQuantity += existing.get().getQuantity();
        }

        validateQuantity(product, newQuantity);

        if (existing.isPresent()) {
            existing.get().setQuantity(newQuantity);
            cartItemRepository.save(existing.get());
        } else {
            CartItem item = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(quantity)
                .build();

            CartItem savedItem = cartItemRepository.save(item);
            cart.getItems().add(savedItem);
        }
    }

    private void updateItem(
            Cart cart,
            Long productId,
            Integer quantity
    ) {
        CartItem item =
                cartItemRepository.findByCartIdAndProductId(
                                cart.getId(),
                                productId
                        )
                        .orElseThrow(() ->
                                new ApiException(
                                        HttpStatus.NOT_FOUND,
                                        "Product is not in the cart"
                                )
                        );

        validateQuantity(item.getProduct(), quantity);

        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    private void removeItem(
            Cart cart,
            Long productId
    ) {
        CartItem item =
                cartItemRepository.findByCartIdAndProductId(
                                cart.getId(),
                                productId
                        )
                        .orElseThrow(() ->
                                new ApiException(
                                        HttpStatus.NOT_FOUND,
                                        "Product is not in the cart"
                                )
                        );

        cartItemRepository.delete(item);
    }

    private Product getAvailableProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"
                        )
                );

        if (!product.isActive()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Product is not available"
            );
        }

        return product;
    }

    private void validateQuantity(
            Product product,
            Integer quantity
    ) {
        if (quantity == null || quantity < 1) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be at least 1"
            );
        }

        if (quantity > product.getStock()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Only " + product.getStock()
                            + " items are available"
            );
        }
    }

    public Map<String, Object> cartResponse(Cart cart) {
        List<Map<String, Object>> itemResponses =
                new ArrayList<>();

        BigDecimal total = BigDecimal.ZERO;
        int itemCount = 0;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();

            BigDecimal subtotal =
                    product.getPrice().multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    );

            total = total.add(subtotal);
            itemCount += item.getQuantity();

            Map<String, Object> itemResponse =
                    new LinkedHashMap<>();

            itemResponse.put("itemId", item.getId());
            itemResponse.put("productId", product.getId());
            itemResponse.put("code", product.getCode());
            itemResponse.put("name", product.getName());
            itemResponse.put("imageUrl", product.getImageUrl());
            itemResponse.put("price", product.getPrice());
            itemResponse.put("stock", product.getStock());
            itemResponse.put("quantity", item.getQuantity());
            itemResponse.put("subtotal", subtotal);

            itemResponses.add(itemResponse);
        }

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("cartId", cart.getId());
        response.put("guestToken", cart.getGuestToken());
        response.put("items", itemResponses);
        response.put("itemCount", itemCount);
        response.put("total", total);

        return response;
    }
}