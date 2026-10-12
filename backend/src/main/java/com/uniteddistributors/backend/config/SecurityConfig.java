package com.uniteddistributors.backend.config;

import com.uniteddistributors.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // REST API නිසා CSRF disable කරනවා
                .csrf(csrf -> csrf.disable())

                // React frontend requests සඳහා CORS
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // JWT භාවිත කරන නිසා server sessions භාවිත නොකරයි
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // API permissions
                .authorizeHttpRequests(auth -> auth

                        // Login සහ register ඕනෑම කෙනෙකුට
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // Products login නොවීත් බලන්න පුළුවන්
                        .requestMatchers(
                                "/api/products/**"
                        ).permitAll()

// Uploaded product images ඕනෑම කෙනෙකුට display කිරීමට
.requestMatchers(
        "/uploads/**"
).permitAll()

                        // Guest cart login නොවී භාවිත කරන්න පුළුවන්
                        .requestMatchers(
                                "/api/cart/guest/**"
                        ).permitAll()

                        // Admin APIs ADMIN role එකට පමණයි
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")
                        

                        // අනෙක් APIs සඳහා login අවශ්‍යයි
                        .anyRequest()
                        .authenticated()
                )

                // JWT filter එක Spring Security filter එකට කලින් run කරනවා
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /*
     * Password database එකේ plain text ලෙස save නොකර
     * BCrypt encryption භාවිත කරනවා.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*
     * Login කරන විට email සහ password authenticate කිරීමට
     * AuthenticationManager එක ලබා දෙනවා.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }

    /*
     * React frontend එකෙන් backend එකට requests එවීමට
     * permission ලබා දෙන CORS configuration එක.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // Vite සහ port 3000 දෙකටම permission
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}