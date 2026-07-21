package com.cashplus.ouverture.controller;

import com.cashplus.ouverture.dto.auth.CreateUserRequest;
import com.cashplus.ouverture.dto.auth.CreateUserResponse;
import com.cashplus.ouverture.dto.auth.UpdateUserRequest;
import com.cashplus.ouverture.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<CreateUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<CreateUserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        CreateUserResponse response = adminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<CreateUserResponse> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        CreateUserResponse response = adminService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }
}
