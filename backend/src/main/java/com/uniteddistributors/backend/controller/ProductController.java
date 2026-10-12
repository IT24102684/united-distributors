package com.uniteddistributors.backend.controller;

import com.uniteddistributors.backend.exception.ApiException;
import com.uniteddistributors.backend.model.Product;
import com.uniteddistributors.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    @GetMapping
    public List<Product> getProducts() {
        return productRepository
                .findByActiveTrueOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"
                        )
                );

        if (!product.isActive()) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
            );
        }

        return product;
    }
}