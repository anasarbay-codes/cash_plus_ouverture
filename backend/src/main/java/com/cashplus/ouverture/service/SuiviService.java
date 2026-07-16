package com.cashplus.ouverture.service;

import com.cashplus.ouverture.dto.common.PageResponse;
import com.cashplus.ouverture.dto.suivi.SuiviPhotoResponse;
import com.cashplus.ouverture.dto.suivi.SuiviRequest;
import com.cashplus.ouverture.dto.suivi.SuiviResponse;
import com.cashplus.ouverture.exception.ForbiddenActionException;
import com.cashplus.ouverture.exception.InvalidStateException;
import com.cashplus.ouverture.exception.ResourceNotFoundException;
import com.cashplus.ouverture.model.DemandeOuverture;
import com.cashplus.ouverture.model.SuiviOuverture;
import com.cashplus.ouverture.model.SuiviPhoto;
import com.cashplus.ouverture.model.User;
import com.cashplus.ouverture.model.enums.DemandeState;
import com.cashplus.ouverture.model.enums.Role;
import com.cashplus.ouverture.model.enums.SuiviState;
import com.cashplus.ouverture.repository.DemandeOuvertureRepository;
import com.cashplus.ouverture.repository.SuiviOuvertureRepository;
import com.cashplus.ouverture.repository.SuiviPhotoRepository;
import com.cashplus.ouverture.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import com.cashplus.ouverture.util.ReferenceGenerator;
import com.cashplus.ouverture.config.UploadConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class SuiviService {

    private static final Logger log = LoggerFactory.getLogger(SuiviService.class);

    private final SuiviOuvertureRepository suiviRepository;
    private final SuiviPhotoRepository suiviPhotoRepository;
    private final DemandeOuvertureRepository demandeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final UploadConfig uploadConfig;

    public SuiviService(SuiviOuvertureRepository suiviRepository,
                        SuiviPhotoRepository suiviPhotoRepository,
                        DemandeOuvertureRepository demandeRepository,
                        UserRepository userRepository,
                        FileStorageService fileStorageService,
                        UploadConfig uploadConfig) {
        this.suiviRepository = suiviRepository;
        this.suiviPhotoRepository = suiviPhotoRepository;
        this.demandeRepository = demandeRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.uploadConfig = uploadConfig;
    }

    public List<SuiviResponse> listSuivis(String email, Role role) {
        User user = resolveUser(email);
        List<SuiviOuverture> suivis;
        if (role == Role.AGENT) {
            suivis = suiviRepository.findByAssignedAgentId(user.getId());
        } else {
            suivis = suiviRepository.findAll();
        }
        return suivis.stream().map(this::toResponse).toList();
    }

    public List<SuiviResponse> listByState(String email, Role role, SuiviState state) {
        User user = resolveUser(email);
        List<SuiviOuverture> suivis;
        if (role == Role.AGENT) {
            suivis = suiviRepository.findByAssignedAgentIdAndState(user.getId(), state);
        } else {
            suivis = suiviRepository.findByState(state);
        }
        return suivis.stream().map(this::toResponse).toList();
    }

    public PageResponse<SuiviResponse> listSuivis(String email, Role role, SuiviState state, int page, int size) {
        User user = resolveUser(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<SuiviOuverture> result;
        if (role == Role.AGENT) {
            if (state != null) {
                result = suiviRepository.findByAssignedAgentIdAndState(user.getId(), state, pageable);
            } else {
                result = suiviRepository.findByAssignedAgentId(user.getId(), pageable);
            }
        } else {
            if (state != null) {
                result = suiviRepository.findByState(state, pageable);
            } else {
                result = suiviRepository.findAll(pageable);
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

    public SuiviResponse getById(Long id, String email, Role role) {
        SuiviOuverture s = findOrThrow(id);
        if (role == Role.AGENT) {
            User user = resolveUser(email);
            if (!s.getAssignedAgent().getId().equals(user.getId())) {
                throw new ForbiddenActionException("Access this suivi", "VALIDATEUR or MANAGER");
            }
        }
        return toResponse(s);
    }

    @Transactional
    public SuiviResponse createFromDemande(Long demandeId, String email) {
        User agent = resolveUser(email);
        DemandeOuverture demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeOuverture", "id", demandeId));

        if (demande.getState() != DemandeState.VALIDATED) {
            throw new InvalidStateException("DemandeOuverture", demande.getState().name(), "VALIDATED");
        }

        if (suiviRepository.findByDemandeId(demandeId).isPresent()) {
            throw new IllegalArgumentException("A suivi already exists for demande " + demandeId);
        }

        SuiviOuverture suivi = SuiviOuverture.builder()
                .reference(demande.getReference())
                .address(demande.getAddress())
                .city(demande.getCity())
                .state(SuiviState.PREPARATION)
                .demande(demande)
                .assignedAgent(agent)
                .build();

        SuiviOuverture saved = suiviRepository.save(suivi);
        log.info("Created suivi {} from demande {}", saved.getId(), demandeId);
        return toResponse(saved);
    }

    @Transactional
    public SuiviResponse update(Long id, SuiviRequest request, String email, Role role) {
        SuiviOuverture s = findOrThrow(id);
        requireOwnerOrPrivileged(s, email, role);

        if (s.getState() == SuiviState.LIVE) {
            throw new InvalidStateException("SuiviOuverture", s.getState().name(), "PREPARATION, CODIFICATION, CONTROL or INSTALLATION");
        }

        if (request.getAgencyName() != null) s.setAgencyName(request.getAgencyName());
        if (request.getAddress() != null) s.setAddress(request.getAddress());
        if (request.getCity() != null) s.setCity(request.getCity());
        if (request.getLegalDocumentsReady() != null) s.setLegalDocumentsReady(request.getLegalDocumentsReady());
        if (request.getFitOutReady() != null) s.setFitOutReady(request.getFitOutReady());
        if (request.getNetworkSetupReady() != null) s.setNetworkSetupReady(request.getNetworkSetupReady());
        if (request.getComplianceChecked() != null) s.setComplianceChecked(request.getComplianceChecked());
        if (request.getInstallationDone() != null) s.setInstallationDone(request.getInstallationDone());

        SuiviOuverture saved = suiviRepository.save(s);
        log.info("Updated suivi {}", id);
        return toResponse(saved);
    }

    @Transactional
    public SuiviPhotoResponse uploadPhoto(Long suiviId, MultipartFile file, String email) {
        SuiviOuverture s = findOrThrow(suiviId);
        User user = resolveUser(email);
        if (user.getRole() == Role.AGENT) {
            requireOwner(s, email);
        }

        String filePath = fileStorageService.storeSuiviPhoto(suiviId, file);

        SuiviPhoto photo = SuiviPhoto.builder()
                .filePath(filePath)
                .uploadedAt(LocalDateTime.now())
                .suivi(s)
                .build();

        SuiviPhoto saved = suiviPhotoRepository.save(photo);
        log.info("Uploaded photo {} for suivi {}", saved.getId(), suiviId);

        SuiviPhotoResponse response = new SuiviPhotoResponse();
        response.setId(saved.getId());
        response.setFilePath(saved.getFilePath());
        response.setUploadedAt(saved.getUploadedAt());
        return response;
    }

    public Resource getPhotoFile(Long suiviId, Long photoId, String email) {
        SuiviOuverture s = findOrThrow(suiviId);
        User user = resolveUser(email);
        if (user.getRole() == Role.AGENT) {
            requireOwner(s, email);
        }

        SuiviPhoto photo = suiviPhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("SuiviPhoto", "id", photoId));

        if (!photo.getSuivi().getId().equals(suiviId)) {
            throw new ResourceNotFoundException("SuiviPhoto", "id", photoId);
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
    public SuiviResponse finishPreparation(Long id, String email) {
        SuiviOuverture s = findOrThrow(id);

        User user = resolveUser(email);
        if (user.getRole() != Role.MANAGER) {
            throw new ForbiddenActionException("Finish preparation", "MANAGER");
        }

        if (s.getState() != SuiviState.PREPARATION) {
            throw new InvalidStateException("SuiviOuverture", s.getState().name(), "PREPARATION");
        }

        if (!s.isLegalDocumentsReady()) {
            throw new InvalidStateException("Cannot finish preparation: legal documents not ready");
        }

        s.setState(SuiviState.CODIFICATION);
        SuiviOuverture saved = suiviRepository.save(s);
        log.info("Suivi {} preparation finished by {}", id, email);
        return toResponse(saved);
    }

    @Transactional
    public SuiviResponse finishCodification(Long id, String email) {
        SuiviOuverture s = findOrThrow(id);

        User user = resolveUser(email);
        if (user.getRole() != Role.VALIDATEUR) {
            throw new ForbiddenActionException("Finish codification", "VALIDATEUR");
        }

        if (s.getState() != SuiviState.CODIFICATION) {
            throw new InvalidStateException("SuiviOuverture", s.getState().name(), "CODIFICATION");
        }

        if (!s.isFitOutReady() || !s.isNetworkSetupReady()) {
            throw new InvalidStateException("Cannot finish codification: fit_out and network must be ready");
        }

        long photoCount = suiviPhotoRepository.countBySuiviId(id);
        if (photoCount < 1) {
            throw new InvalidStateException("Cannot finish codification: at least 1 photo required");
        }

        s.setState(SuiviState.CONTROL);
        SuiviOuverture saved = suiviRepository.save(s);
        log.info("Suivi {} codification finished by {}", id, email);
        return toResponse(saved);
    }

    @Transactional
    public SuiviResponse startInstallation(Long id, String email) {
        SuiviOuverture s = findOrThrow(id);

        User user = resolveUser(email);
        if (user.getRole() != Role.MANAGER) {
            throw new ForbiddenActionException("Start installation", "MANAGER");
        }

        if (s.getState() != SuiviState.CONTROL) {
            throw new InvalidStateException("SuiviOuverture", s.getState().name(), "CONTROL");
        }

        if (!s.isComplianceChecked()) {
            throw new InvalidStateException("Cannot start installation: compliance not checked");
        }

        s.setState(SuiviState.INSTALLATION);
        SuiviOuverture saved = suiviRepository.save(s);
        log.info("Suivi {} installation started by {}", id, email);
        return toResponse(saved);
    }

    @Transactional
    public SuiviResponse confirmLive(Long id, String email) {
        SuiviOuverture s = findOrThrow(id);

        User user = resolveUser(email);
        if (user.getRole() != Role.MANAGER) {
            throw new ForbiddenActionException("Confirm live", "MANAGER");
        }

        if (s.getState() != SuiviState.INSTALLATION) {
            throw new InvalidStateException("SuiviOuverture", s.getState().name(), "INSTALLATION");
        }

        if (!s.isInstallationDone()) {
            throw new InvalidStateException("Cannot confirm live: installation not done");
        }

        s.setState(SuiviState.LIVE);
        s.setStartDate(LocalDate.now());
        SuiviOuverture saved = suiviRepository.save(s);
        log.info("Suivi {} confirmed live by {}", id, email);
        return toResponse(saved);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private SuiviOuverture findOrThrow(Long id) {
        return suiviRepository.findByIdWithPhotos(id)
                .orElseThrow(() -> new ResourceNotFoundException("SuiviOuverture", "id", id));
    }

    private void requireOwner(SuiviOuverture s, String email) {
        User user = resolveUser(email);
        if (!s.getAssignedAgent().getId().equals(user.getId())) {
            throw new ForbiddenActionException("Modify this suivi", "AGENT (owner)");
        }
    }

    private void requireOwnerOrPrivileged(SuiviOuverture s, String email, Role role) {
        if (role == Role.AGENT) {
            requireOwner(s, email);
        }
    }

    private SuiviResponse toResponse(SuiviOuverture s) {
        SuiviResponse r = new SuiviResponse();
        r.setId(s.getId());
        r.setReference(s.getReference());
        r.setAgencyName(s.getAgencyName());
        r.setAddress(s.getAddress());
        r.setCity(s.getCity());
        r.setLegalDocumentsReady(s.isLegalDocumentsReady());
        r.setFitOutReady(s.isFitOutReady());
        r.setNetworkSetupReady(s.isNetworkSetupReady());
        r.setComplianceChecked(s.isComplianceChecked());
        r.setInstallationDone(s.isInstallationDone());
        r.setStartDate(s.getStartDate());
        r.setState(s.getState());
        r.setDemandeId(s.getDemande() != null ? s.getDemande().getId() : null);
        r.setAssignedAgentId(s.getAssignedAgent().getId());
        r.setAssignedAgentName(s.getAssignedAgent().getName());
        r.setPhotoCount(s.getPhotos() != null ? s.getPhotos().size() : 0);
        if (s.getPhotos() != null) {
            r.setPhotos(s.getPhotos().stream().map(p -> {
                SuiviPhotoResponse pr = new SuiviPhotoResponse();
                pr.setId(p.getId());
                pr.setFilePath(p.getFilePath());
                pr.setUploadedAt(p.getUploadedAt());
                return pr;
            }).toList());
        }
        return r;
    }
}
