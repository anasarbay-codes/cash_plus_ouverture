package com.cashplus.ouverture.service;

import com.cashplus.ouverture.dto.common.PageResponse;
import com.cashplus.ouverture.dto.demande.DemandeRequest;
import com.cashplus.ouverture.dto.demande.DemandeResponse;
import com.cashplus.ouverture.dto.demande.PhotoResponse;
import com.cashplus.ouverture.exception.ForbiddenActionException;
import com.cashplus.ouverture.exception.InvalidStateException;
import com.cashplus.ouverture.exception.ResourceNotFoundException;
import com.cashplus.ouverture.model.DemandeOuverture;
import com.cashplus.ouverture.model.DemandePhoto;
import com.cashplus.ouverture.model.Prospection;
import com.cashplus.ouverture.model.User;
import com.cashplus.ouverture.model.enums.DemandeState;
import com.cashplus.ouverture.model.enums.ProspectionState;
import com.cashplus.ouverture.model.enums.Role;
import com.cashplus.ouverture.model.enums.SuiviState;
import com.cashplus.ouverture.model.SuiviOuverture;
import com.cashplus.ouverture.repository.DemandeOuvertureRepository;
import com.cashplus.ouverture.repository.DemandePhotoRepository;
import com.cashplus.ouverture.repository.ProspectionRepository;
import com.cashplus.ouverture.repository.SuiviOuvertureRepository;
import com.cashplus.ouverture.repository.UserRepository;
import com.cashplus.ouverture.util.ReferenceGenerator;
import com.cashplus.ouverture.config.UploadConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class DemandeService {

    private static final Logger log = LoggerFactory.getLogger(DemandeService.class);
    private static final int MIN_PHOTOS_TO_SUBMIT = 5;

    private final DemandeOuvertureRepository demandeRepository;
    private final DemandePhotoRepository demandePhotoRepository;
    private final ProspectionRepository prospectionRepository;
    private final SuiviOuvertureRepository suiviRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ReferenceGenerator referenceGenerator;
    private final UploadConfig uploadConfig;

    public DemandeService(DemandeOuvertureRepository demandeRepository,
                          DemandePhotoRepository demandePhotoRepository,
                          ProspectionRepository prospectionRepository,
                          SuiviOuvertureRepository suiviRepository,
                          UserRepository userRepository,
                          FileStorageService fileStorageService,
                          ReferenceGenerator referenceGenerator,
                          UploadConfig uploadConfig) {
        this.demandeRepository = demandeRepository;
        this.demandePhotoRepository = demandePhotoRepository;
        this.prospectionRepository = prospectionRepository;
        this.suiviRepository = suiviRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.referenceGenerator = referenceGenerator;
        this.uploadConfig = uploadConfig;
    }

    public List<DemandeResponse> listDemandes(String email, Role role) {
        User user = resolveUser(email);
        List<DemandeOuverture> demandes;
        if (role == Role.AGENT) {
            demandes = demandeRepository.findByAssignedAgentId(user.getId());
        } else {
            demandes = demandeRepository.findAll();
        }
        return demandes.stream().map(this::toResponse).toList();
    }

    public List<DemandeResponse> listByState(String email, Role role, DemandeState state) {
        User user = resolveUser(email);
        List<DemandeOuverture> demandes;
        if (role == Role.AGENT) {
            demandes = demandeRepository.findByAssignedAgentIdAndState(user.getId(), state);
        } else {
            demandes = demandeRepository.findByState(state);
        }
        return demandes.stream().map(this::toResponse).toList();
    }

    public PageResponse<DemandeResponse> listDemandes(String email, Role role, DemandeState state, int page, int size) {
        User user = resolveUser(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<DemandeOuverture> result;
        if (role == Role.AGENT) {
            if (state != null) {
                result = demandeRepository.findByAssignedAgentIdAndState(user.getId(), state, pageable);
            } else {
                result = demandeRepository.findByAssignedAgentId(user.getId(), pageable);
            }
        } else {
            if (state != null) {
                result = demandeRepository.findByState(state, pageable);
            } else {
                result = demandeRepository.findAll(pageable);
            }
        }
        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    public DemandeResponse getById(Long id, String email, Role role) {
        DemandeOuverture d = findOrThrow(id);
        if (role == Role.AGENT) {
            User user = resolveUser(email);
            if (!d.getAssignedAgent().getId().equals(user.getId())) {
                throw new ForbiddenActionException("Access this demande", "VALIDATEUR or MANAGER");
            }
        }
        return toResponse(d);
    }

    @Transactional
    public DemandeResponse createFromProspection(Long prospectionId, String email) {
        User agent = resolveUser(email);
        Prospection prospection = prospectionRepository.findById(prospectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prospection", "id", prospectionId));

        if (prospection.getState() != ProspectionState.CONFIRMED) {
            throw new InvalidStateException("Prospection", prospection.getState().name(), "CONFIRMED");
        }

        if (demandeRepository.findByProspectionId(prospectionId).isPresent()) {
            throw new IllegalArgumentException("A demande already exists for prospection " + prospectionId);
        }

        DemandeOuverture demande = DemandeOuverture.builder()
                .reference(referenceGenerator.generateDemandeReference())
                .requestDate(LocalDate.now())
                .ownerName(prospection.getOwnerName())
                .ownerPhone(prospection.getPhone())
                .address(prospection.getAddress())
                .city(prospection.getCity())
                .state(DemandeState.DATA_COLLECTION)
                .prospection(prospection)
                .assignedAgent(agent)
                .build();

        DemandeOuverture saved = demandeRepository.save(demande);
        log.info("Created demande {} from prospection {}", saved.getId(), prospectionId);
        return toResponse(saved);
    }

    @Transactional
    public DemandeResponse update(Long id, DemandeRequest request, String email, Role role) {
        DemandeOuverture d = findOrThrow(id);
        requireOwnerOrPrivileged(d, email, role);

        if (d.getState() != DemandeState.DATA_COLLECTION && d.getState() != DemandeState.REJECTED) {
            throw new InvalidStateException("Demande", d.getState().name(), "DATA_COLLECTION or REJECTED");
        }

        if (request.getOwnerName() != null) d.setOwnerName(request.getOwnerName());
        if (request.getOwnerPhone() != null) d.setOwnerPhone(request.getOwnerPhone());
        if (request.getOwnerEmail() != null) d.setOwnerEmail(request.getOwnerEmail());
        if (request.getAddress() != null) d.setAddress(request.getAddress());
        if (request.getCity() != null) d.setCity(request.getCity());
        if (request.getAreaSqm() != null) d.setAreaSqm(request.getAreaSqm());
        if (request.getAgencyCategory() != null) d.setAgencyCategory(request.getAgencyCategory());

        DemandeOuverture saved = demandeRepository.save(d);
        log.info("Updated demande {}", id);
        return toResponse(saved);
    }

    @Transactional
    public PhotoResponse uploadPhoto(Long demandeId, MultipartFile file, String email) {
        DemandeOuverture d = findOrThrow(demandeId);
        User user = resolveUser(email);
        requireOwnerOrPrivileged(d, email, user.getRole());

        if (d.getState() != DemandeState.DATA_COLLECTION && d.getState() != DemandeState.REJECTED) {
            throw new InvalidStateException("Demande", d.getState().name(), "DATA_COLLECTION or REJECTED");
        }

        String filePath = fileStorageService.storeDemandePhoto(demandeId, file);

        DemandePhoto photo = DemandePhoto.builder()
                .filePath(filePath)
                .uploadedAt(java.time.LocalDateTime.now())
                .demande(d)
                .build();

        DemandePhoto saved = demandePhotoRepository.save(photo);
        log.info("Uploaded photo {} for demande {}", saved.getId(), demandeId);

        PhotoResponse response = new PhotoResponse();
        response.setId(saved.getId());
        response.setFilePath(saved.getFilePath());
        response.setUploadedAt(saved.getUploadedAt());
        return response;
    }

    @Transactional
    public void deletePhoto(Long demandeId, Long photoId, String email) {
        DemandeOuverture d = findOrThrow(demandeId);
        User user = resolveUser(email);
        requireOwnerOrPrivileged(d, email, user.getRole());

        if (d.getState() != DemandeState.DATA_COLLECTION && d.getState() != DemandeState.REJECTED) {
            throw new InvalidStateException("Demande", d.getState().name(), "DATA_COLLECTION or REJECTED");
        }

        DemandePhoto photo = demandePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandePhoto", "id", photoId));

        if (!photo.getDemande().getId().equals(demandeId)) {
            throw new IllegalArgumentException("Photo " + photoId + " does not belong to demande " + demandeId);
        }

        fileStorageService.deleteFile(photo.getFilePath());
        demandePhotoRepository.delete(photo);
        log.info("Deleted photo {} from demande {}", photoId, demandeId);
    }

    public Resource getPhotoFile(Long demandeId, Long photoId, String email) {
        DemandeOuverture d = findOrThrow(demandeId);
        requireOwnerOrPrivileged(d, email, resolveUser(email).getRole());

        DemandePhoto photo = demandePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandePhoto", "id", photoId));

        if (!photo.getDemande().getId().equals(demandeId)) {
            throw new ResourceNotFoundException("DemandePhoto", "id", photoId);
        }

        try {
            Path file = Paths.get(uploadConfig.getBaseDir(), photo.getFilePath());
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found or not readable: " + photo.getFilePath());
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + photo.getFilePath(), e);
        }
    }

    @Transactional
    public DemandeResponse submit(Long id, String email) {
        DemandeOuverture d = findOrThrow(id);
        User user = resolveUser(email);
        requireOwnerOrPrivileged(d, email, user.getRole());

        if (d.getState() != DemandeState.DATA_COLLECTION) {
            throw new InvalidStateException("Demande", d.getState().name(), "DATA_COLLECTION");
        }

        long photoCount = demandePhotoRepository.countByDemandeId(id);
        if (photoCount < MIN_PHOTOS_TO_SUBMIT) {
            throw new InvalidStateException("Cannot submit demande with " + photoCount + " photos (minimum " + MIN_PHOTOS_TO_SUBMIT + " required)");
        }

        d.setState(DemandeState.SUBMITTED);
        d.setSubmittedDate(LocalDate.now());
        DemandeOuverture saved = demandeRepository.save(d);
        log.info("Demande {} submitted", id);
        return toResponse(saved);
    }

    @Transactional
    public DemandeResponse validate(Long id, String email) {
        DemandeOuverture d = findOrThrow(id);

        User user = resolveUser(email);
        if (user.getRole() != Role.VALIDATEUR && user.getRole() != Role.MANAGER) {
            throw new ForbiddenActionException("Validate a demande", "VALIDATEUR or MANAGER");
        }

        if (d.getState() != DemandeState.SUBMITTED) {
            throw new InvalidStateException("Demande", d.getState().name(), "SUBMITTED");
        }

        d.setState(DemandeState.VALIDATED);
        demandeRepository.save(d);

        SuiviOuverture suivi = SuiviOuverture.builder()
                .reference(d.getReference())
                .address(d.getAddress())
                .city(d.getCity())
                .state(SuiviState.PREPARATION)
                .demande(d)
                .assignedAgent(d.getAssignedAgent())
                .build();
        suiviRepository.save(suivi);

        log.info("Demande {} validated by {}, created suivi {}", id, email, suivi.getId());
        return toResponse(d);
    }

    @Transactional
    public DemandeResponse reject(Long id, String rejectionReason, String email) {
        DemandeOuverture d = findOrThrow(id);

        User user = resolveUser(email);
        if (user.getRole() != Role.VALIDATEUR && user.getRole() != Role.MANAGER) {
            throw new ForbiddenActionException("Reject a demande", "VALIDATEUR or MANAGER");
        }

        if (d.getState() != DemandeState.SUBMITTED) {
            throw new InvalidStateException("Demande", d.getState().name(), "SUBMITTED");
        }

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        d.setState(DemandeState.REJECTED);
        d.setRejectionReason(rejectionReason);
        DemandeOuverture saved = demandeRepository.save(d);
        log.info("Demande {} rejected by {}", id, email);
        return toResponse(saved);
    }

    @Transactional
    public DemandeResponse reopen(Long id, String email) {
        DemandeOuverture d = findOrThrow(id);
        requireOwner(d, email);

        if (d.getState() != DemandeState.REJECTED) {
            throw new InvalidStateException("Demande", d.getState().name(), "REJECTED");
        }

        d.setState(DemandeState.DATA_COLLECTION);
        d.setRejectionReason(null);
        DemandeOuverture saved = demandeRepository.save(d);
        log.info("Demande {} reopened", id);
        return toResponse(saved);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private DemandeOuverture findOrThrow(Long id) {
        return demandeRepository.findByIdWithPhotos(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeOuverture", "id", id));
    }

    private void requireOwner(DemandeOuverture d, String email) {
        User user = resolveUser(email);
        if (!d.getAssignedAgent().getId().equals(user.getId())) {
            throw new ForbiddenActionException("Modify this demande", "AGENT (owner)");
        }
    }

    private void requireOwnerOrPrivileged(DemandeOuverture d, String email, Role role) {
        if (role == Role.AGENT) {
            requireOwner(d, email);
        }
    }

    private DemandeResponse toResponse(DemandeOuverture d) {
        DemandeResponse r = new DemandeResponse();
        r.setId(d.getId());
        r.setReference(d.getReference());
        r.setRequestDate(d.getRequestDate());
        r.setSubmittedDate(d.getSubmittedDate());
        r.setOwnerName(d.getOwnerName());
        r.setOwnerPhone(d.getOwnerPhone());
        r.setOwnerEmail(d.getOwnerEmail());
        r.setAddress(d.getAddress());
        r.setCity(d.getCity());
        r.setAreaSqm(d.getAreaSqm());
        r.setAgencyCategory(d.getAgencyCategory());
        r.setState(d.getState());
        r.setRejectionReason(d.getRejectionReason());
        r.setProspectionId(d.getProspection() != null ? d.getProspection().getId() : null);
        r.setAssignedAgentId(d.getAssignedAgent().getId());
        r.setAssignedAgentName(d.getAssignedAgent().getName());
        r.setPhotoCount(d.getPhotos() != null ? d.getPhotos().size() : 0);
        if (d.getPhotos() != null) {
            r.setPhotos(d.getPhotos().stream().map(p -> {
                PhotoResponse pr = new PhotoResponse();
                pr.setId(p.getId());
                pr.setFilePath(p.getFilePath());
                pr.setUploadedAt(p.getUploadedAt());
                return pr;
            }).toList());
        }
        return r;
    }
}
