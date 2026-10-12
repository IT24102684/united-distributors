package com.uniteddistributors.backend.config;

import com.uniteddistributors.backend.model.Role;
import com.uniteddistributors.backend.model.User;
import com.uniteddistributors.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name}")
    private String adminName;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User admin = User.builder()
                    .fullName(adminName)
                    .email(adminEmail.toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .mobile("0000000000")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();

            userRepository.save(admin);

            System.out.println(
                    "Default admin created: " + adminEmail
            );
        }
    }
}