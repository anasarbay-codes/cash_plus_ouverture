package com.cashplus.ouverture.service;

import com.cashplus.ouverture.dto.auth.CreateUserRequest;
import com.cashplus.ouverture.dto.auth.CreateUserResponse;
import com.cashplus.ouverture.dto.auth.UpdateUserRequest;
import com.cashplus.ouverture.model.User;
import com.cashplus.ouverture.model.enums.Role;
import com.cashplus.ouverture.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<CreateUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new CreateUserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()))
                .toList();
    }

    public CreateUserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.AGENT;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User saved = userRepository.save(user);

        log.info("User created: {} ({}) by manager", saved.getEmail(), saved.getRole());

        return new CreateUserResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    public CreateUserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);

        log.info("User updated: {} ({}) by manager", saved.getEmail(), saved.getRole());

        return new CreateUserResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }
}
