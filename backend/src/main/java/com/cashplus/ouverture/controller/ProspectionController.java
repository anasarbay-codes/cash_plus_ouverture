package com.cashplus.ouverture.controller;

import com.cashplus.ouverture.dto.common.PageResponse;
import com.cashplus.ouverture.dto.prospection.ProspectionRequest;
import com.cashplus.ouverture.dto.prospection.ProspectionResponse;
import com.cashplus.ouverture.model.DemandeOuverture;
import com.cashplus.ouverture.model.enums.ProspectionState;
import com.cashplus.ouverture.model.enums.Role;
import com.cashplus.ouverture.service.ProspectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prospections")
public class ProspectionController {

    private final ProspectionService prospectionService;

    public ProspectionController(ProspectionService prospectionService) {
        this.prospectionService = prospectionService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProspectionResponse>> list(
            @RequestParam(required = false) ProspectionState state,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(prospectionService.listProspections(email, role, state, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProspectionResponse> getById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(prospectionService.getById(id, email, role));
    }

    @PostMapping
    public ResponseEntity<ProspectionResponse> create(
            @Valid @RequestBody ProspectionRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(prospectionService.create(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProspectionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProspectionRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(prospectionService.update(id, request, email, role));
    }

    @PatchMapping("/{id}/mark-interested")
    public ResponseEntity<ProspectionResponse> markInterested(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(prospectionService.markInterested(id, email));
    }

    @PatchMapping("/{id}/mark-not-interested")
    public ResponseEntity<ProspectionResponse> markNotInterested(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String email = authentication.getName();
        String reason = body.get("rejectionReason");
        return ResponseEntity.ok(prospectionService.markNotInterested(id, reason, email));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<DemandeOuverture> confirm(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(prospectionService.confirm(id, email));
    }

    private Role extractRole(Authentication authentication) {
        for (GrantedAuthority auth : authentication.getAuthorities()) {
            String authority = auth.getAuthority();
            if (authority.equals("ROLE_AGENT")) return Role.AGENT;
            if (authority.equals("ROLE_VALIDATEUR")) return Role.VALIDATEUR;
            if (authority.equals("ROLE_MANAGER")) return Role.MANAGER;
        }
        throw new IllegalStateException("No valid role found for authenticated user");
    }
}
