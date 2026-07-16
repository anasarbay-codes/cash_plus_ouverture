package com.cashplus.ouverture.controller;

import com.cashplus.ouverture.dto.common.PageResponse;
import com.cashplus.ouverture.dto.suivi.SuiviPhotoResponse;
import com.cashplus.ouverture.dto.suivi.SuiviRequest;
import com.cashplus.ouverture.dto.suivi.SuiviResponse;
import com.cashplus.ouverture.model.enums.Role;
import com.cashplus.ouverture.model.enums.SuiviState;
import com.cashplus.ouverture.service.SuiviService;
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

@RestController
@RequestMapping("/api/suivis")
public class SuiviController {

    private final SuiviService suiviService;

    public SuiviController(SuiviService suiviService) {
        this.suiviService = suiviService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<SuiviResponse>> list(
            @RequestParam(required = false) SuiviState state,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(suiviService.listSuivis(email, role, state, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuiviResponse> getById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(suiviService.getById(id, email, role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuiviResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SuiviRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Role role = extractRole(authentication);
        return ResponseEntity.ok(suiviService.update(id, request, email, role));
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<SuiviPhotoResponse> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(suiviService.uploadPhoto(id, file, email));
    }

    @GetMapping("/{id}/photos/{photoId}/file")
    public ResponseEntity<Resource> getPhotoFile(
            @PathVariable Long id,
            @PathVariable Long photoId,
            Authentication authentication) {
        String email = authentication.getName();
        Resource resource = suiviService.getPhotoFile(id, photoId, email);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    @PatchMapping("/{id}/finish-preparation")
    public ResponseEntity<SuiviResponse> finishPreparation(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(suiviService.finishPreparation(id, email));
    }

    @PatchMapping("/{id}/finish-codification")
    public ResponseEntity<SuiviResponse> finishCodification(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(suiviService.finishCodification(id, email));
    }

    @PatchMapping("/{id}/start-installation")
    public ResponseEntity<SuiviResponse> startInstallation(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(suiviService.startInstallation(id, email));
    }

    @PatchMapping("/{id}/confirm-live")
    public ResponseEntity<SuiviResponse> confirmLive(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(suiviService.confirmLive(id, email));
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
