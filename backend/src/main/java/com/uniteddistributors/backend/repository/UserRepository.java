package com.uniteddistributors.backend.repository;

import com.uniteddistributors.backend.model.Role;
import com.uniteddistributors.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findByRoleOrderByCreatedAtDesc(Role role);

    long countByRole(Role role);
}