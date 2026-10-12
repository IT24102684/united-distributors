package com.uniteddistributors.backend.controller;

import com.uniteddistributors.backend.dto.*;
import com.uniteddistributors.backend.exception.ApiException;
import com.uniteddistributors.backend.model.*;
import com.uniteddistributors.backend.repository.UserRepository;
import com.uniteddistributors.backend.security.*;
import com.uniteddistributors.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final CartService cartService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        String email = request.email()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "An account already exists with this email"
            );
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .password(
                        passwordEncoder.encode(
                                request.password()
                        )
                )
                .mobile(request.mobile().trim())
                .role(Role.USER)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        cartService.mergeGuestCart(
                request.guestToken(),
                user
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createResponse(user));
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        String email = request.email()
                .trim()
                .toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        cartService.mergeGuestCart(
                request.guestToken(),
                user
        );

        return createResponse(user);
    }

    private AuthResponse createResponse(User user) {
        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        user.getEmail()
                );

        String token =
                jwtService.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobile(),
                user.getRole().name()
        );
    }
}