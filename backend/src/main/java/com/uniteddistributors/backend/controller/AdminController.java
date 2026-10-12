package com.uniteddistributors.backend.controller;

import com.uniteddistributors.backend.exception.ApiException;
import com.uniteddistributors.backend.model.*;
import com.uniteddistributors.backend.repository.*;
import com.uniteddistributors.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderService orderService;

    /*
     * USERS AND ADMINS
     */

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers() {
        return userRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::userResponse)
                .toList();
    }

    @GetMapping("/admins")
    public List<Map<String, Object>> getAdmins() {
        return userRepository
                .findByRoleOrderByCreatedAtDesc(Role.ADMIN)
                .stream()
                .map(this::userResponse)
                .toList();
    }

    @PostMapping("/admins")
    public Map<String, Object> assignAdmin(
            @RequestBody EmailRequest request
    ) {
        if (request.email() == null ||
                request.email().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Admin email is required"
            );
        }

        User user = userRepository
                .findByEmailIgnoreCase(request.email())
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "No registered user found with this email"
                        )
                );

        user.setRole(Role.ADMIN);
        userRepository.save(user);

        return userResponse(user);
    }

    @DeleteMapping("/admins/{userId}")
    public Map<String, String> removeAdmin(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User user = findUser(userId);

        if (user.getEmail()
                .equalsIgnoreCase(authentication.getName())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot remove your own admin access"
            );
        }

        if (user.getRole() != Role.ADMIN) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "This user is not an administrator"
            );
        }

        if (userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "The final administrator cannot be removed"
            );
        }

        user.setRole(Role.USER);
        userRepository.save(user);

        return Map.of(
                "message",
                "Administrator access removed"
        );
    }

    @DeleteMapping("/users/{userId}")
    public Map<String, String> deleteUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User user = findUser(userId);

        if (user.getEmail()
                .equalsIgnoreCase(authentication.getName())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot delete your own account"
            );
        }

    
        user.setEnabled(false);
        userRepository.save(user);

        return Map.of(
                "message",
                "User account disabled successfully"
        );
    }

    /*
     * PRODUCTS
     */

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

@PostMapping("/products/upload-image")
public Map<String, String> uploadProductImage(
        @RequestParam("image") MultipartFile image
) {
    if (image.isEmpty()) {
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Please select an image"
        );
    }

    String contentType = image.getContentType();

    if (contentType == null ||
            !(contentType.equals("image/jpeg") ||
              contentType.equals("image/png") ||
              contentType.equals("image/webp"))) {

        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Only JPG, PNG and WEBP images are allowed"
        );
    }

    try {
        Path uploadDirectory = Paths.get(
                "uploads",
                "products"
        );

        Files.createDirectories(uploadDirectory);

        String originalFilename =
                image.getOriginalFilename();

        String extension = "";

        if (originalFilename != null &&
                originalFilename.contains(".")) {
            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        String filename =
                UUID.randomUUID() + extension;

        Path filePath =
                uploadDirectory.resolve(filename);

        Files.copy(
                image.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return Map.of(
                "imageUrl",
                "/uploads/products/" + filename
        );

    } catch (IOException exception) {
        throw new ApiException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to upload product image"
        );
    }
}

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(
            @Valid @RequestBody Product product
    ) {
        

        product.setId(null);
        product.setCode(
                product.getCode().trim().toUpperCase()
        );
        product.setActive(true);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productRepository.save(product));
    }

    @PutMapping("/products/{productId}")
    public Product updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody Product request
    ) {
        Product product = findProduct(productId);

        productRepository
                .findByCodeIgnoreCase(request.getCode())
                .filter(found ->
                        !found.getId().equals(productId)
                )
                .ifPresent(found -> {
                    throw new ApiException(
                            HttpStatus.CONFLICT,
                            "Product code already exists"
                    );
                });

        product.setCode(
                request.getCode().trim().toUpperCase()
        );
        product.setName(request.getName().trim());
        product.setCategory(request.getCategory().trim());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setActive(request.isActive());

        return productRepository.save(product);
    }

    @Transactional
@DeleteMapping("/products/{productId}")
public Map<String, String> deleteProduct(
        @PathVariable Long productId
) {
    Product product = findProduct(productId);

    // Remove this product from all shopping carts first
    cartItemRepository.deleteByProductId(productId);

    // Permanently delete the product from the database
    productRepository.delete(product);

    return Map.of(
            "message",
            "Product deleted successfully"
    );
}

    /*
     * ORDERS
     */

    @GetMapping("/orders")
    public List<CustomerOrder> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PatchMapping("/orders/{orderId}/status")
    public CustomerOrder updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody StatusRequest request
    ) {
        if (request.status() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Order status is required"
            );
        }

        return orderService.updateStatus(
                orderId,
                request.status()
        );
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"
                        )
                );
    }

    private Map<String, Object> userResponse(User user) {
        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("mobile", user.getMobile());
        response.put("role", user.getRole());
        response.put("enabled", user.isEnabled());
        response.put("createdAt", user.getCreatedAt());

        return response;
    }

    public record EmailRequest(String email) {
    }

    public record StatusRequest(OrderStatus status) {
    }
}