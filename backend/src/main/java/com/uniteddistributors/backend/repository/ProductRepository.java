package com.uniteddistributors.backend.repository;

import com.uniteddistributors.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Product> findByCodeIgnoreCase(String code);

    List<Product> findByActiveTrueOrderByCreatedAtDesc();
}