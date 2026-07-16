package com.cashplus.ouverture.controller;

import com.cashplus.ouverture.dto.common.PageResponse;
import com.cashplus.ouverture.dto.demande.DemandeRequest;
import com.cashplus.ouverture.dto.demande.DemandeResponse;
import com.cashplus.ouverture.dto.demande.PhotoResponse;
import com.cashplus.ouverture.model.enums.DemandeState;
import com.cashplus.ouverture.model.enums.Role;
import com.cashplus.ouverture.service.DemandeService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

    private final DemandeService demandeService;

    public DemandeController(DemandeService demandeService) {
        this.demandeService = demandeService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<DemandeResponse>> list(
            @RequestParam(required = false) DemandeState state,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(demandeService.listDemandes(email, role, state, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeResponse> getById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(demandeService.getById(id, email, role));
    }

    @PostMapping
    public ResponseEntity<DemandeResponse> createFromProspection(
            @RequestBody Map<String, Long> body,
            Authentication authentication) {
        String email = authentication.getName();
        Long prospectionId = body.get("prospectionId");
        return ResponseEntity.ok(demandeService.createFromProspection(prospectionId, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DemandeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DemandeRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(demandeService.update(id, request, email, role));
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<PhotoResponse> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(demandeService.uploadPhoto(id, file, email));
    }

    @GetMapping("/{id}/photos/{photoId}/file")
    public ResponseEntity<Resource> getPhotoFile(
            @PathVariable Long id,
            @PathVariable Long photoId,
            Authentication authentication) {
        String email = authentication.getName();
        Resource resource = demandeService.getPhotoFile(id, photoId, email);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable Long id,
            @PathVariable Long photoId,
            Authentication authentication) {
        String email = authentication.getName();
        demandeService.deletePhoto(id, photoId, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/submit")
    public ResponseEntity<DemandeResponse> submit(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(demandeService.submit(id, email));
    }

    @PatchMapping("/{id}/validate")
    public ResponseEntity<DemandeResponse> validate(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(demandeService.validate(id, email));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<DemandeResponse> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String email = authentication.getName();
        String reason = body.get("rejectionReason");
        return ResponseEntity.ok(demandeService.reject(id, reason, email));
    }

    @PatchMapping("/{id}/reopen")
    public ResponseEntity<DemandeResponse> reopen(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(demandeService.reopen(id, email));
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
