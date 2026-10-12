package com.uniteddistributors.backend.repository;

import com.uniteddistributors.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    void deleteByProductId(Long productId);
}