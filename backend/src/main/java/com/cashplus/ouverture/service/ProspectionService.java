package com.cashplus.ouverture.service;

import com.cashplus.ouverture.dto.common.PageResponse;
import com.cashplus.ouverture.dto.prospection.ProspectionRequest;
import com.cashplus.ouverture.dto.prospection.ProspectionResponse;
import com.cashplus.ouverture.exception.ForbiddenActionException;
import com.cashplus.ouverture.exception.InvalidStateException;
import com.cashplus.ouverture.exception.ResourceNotFoundException;
import com.cashplus.ouverture.model.Prospection;
import com.cashplus.ouverture.model.User;
import com.cashplus.ouverture.model.enums.DemandeState;
import com.cashplus.ouverture.model.enums.ProspectionState;
import com.cashplus.ouverture.model.enums.Role;
import com.cashplus.ouverture.model.DemandeOuverture;
import com.cashplus.ouverture.repository.DemandeOuvertureRepository;
import com.cashplus.ouverture.repository.ProspectionRepository;
import com.cashplus.ouverture.repository.UserRepository;
import com.cashplus.ouverture.util.ReferenceGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProspectionService {

    private static final Logger log = LoggerFactory.getLogger(ProspectionService.class);

    private final ProspectionRepository prospectionRepository;
    private final UserRepository userRepository;
    private final DemandeOuvertureRepository demandeOuvertureRepository;
    private final ReferenceGenerator referenceGenerator;

    public ProspectionService(ProspectionRepository prospectionRepository,
                              UserRepository userRepository,
                              DemandeOuvertureRepository demandeOuvertureRepository,
                              ReferenceGenerator referenceGenerator) {
        this.prospectionRepository = prospectionRepository;
        this.userRepository = userRepository;
        this.demandeOuvertureRepository = demandeOuvertureRepository;
        this.referenceGenerator = referenceGenerator;
    }

    public List<ProspectionResponse> listProspections(String email, Role role) {
        User user = resolveUser(email);
        List<Prospection> prospections;
        if (role == Role.AGENT) {
            prospections = prospectionRepository.findByAssignedAgentId(user.getId());
        } else {
            prospections = prospectionRepository.findAll();
        }
        return prospections.stream().map(this::toResponse).toList();
    }

    public PageResponse<ProspectionResponse> listProspections(String email, Role role, ProspectionState state, int page, int size) {
        User user = resolveUser(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Prospection> result;
        if (role == Role.AGENT) {
            if (state != null) {
                result = prospectionRepository.findByAssignedAgentIdAndState(user.getId(), state, pageable);
            } else {
                result = prospectionRepository.findByAssignedAgentId(user.getId(), pageable);
            }
        } else {
            if (state != null) {
                result = prospectionRepository.findByState(state, pageable);
            } else {
                result = prospectionRepository.findAll(pageable);
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

    public List<ProspectionResponse> listByState(String email, Role role, ProspectionState state) {
        User user = resolveUser(email);
        List<Prospection> prospections;
        if (role == Role.AGENT) {
            prospections = prospectionRepository.findByAssignedAgentIdAndState(user.getId(), state);
        } else {
            prospections = prospectionRepository.findByState(state);
        }
        return prospections.stream().map(this::toResponse).toList();
    }

    public ProspectionResponse getById(Long id, String email, Role role) {
        Prospection p = findOrThrow(id);
        if (role == Role.AGENT) {
            User user = resolveUser(email);
            if (!p.getAssignedAgent().getId().equals(user.getId())) {
                throw new ForbiddenActionException("Access this prospection", "VALIDATEUR or MANAGER");
            }
        }
        return toResponse(p);
    }

    @Transactional
    public ProspectionResponse create(ProspectionRequest request, String email) {
        User agent = resolveUser(email);

        if (request.getNationalId() != null &&
                prospectionRepository.existsByOwnerNameAndNationalId(request.getOwnerName(), request.getNationalId())) {
            throw new IllegalArgumentException("Une prospection existe déjà pour " + request.getOwnerName() + " (CIN: " + request.getNationalId() + ")");
        }

        Prospection prospection = Prospection.builder()
                .ownerName(request.getOwnerName())
                .phone(request.getPhone())
                .leadSource(request.getLeadSource())
                .assignedAgent(agent)
                .nationalId(request.getNationalId())
                .address(request.getAddress())
                .city(request.getCity())
                .notes(request.getNotes())
                .state(ProspectionState.NEW)
                .build();

        Prospection saved = prospectionRepository.save(prospection);
        log.info("Created prospection {} for agent {}", saved.getId(), email);
        return toResponse(saved);
    }

    @Transactional
    public ProspectionResponse update(Long id, ProspectionRequest request, String email, Role role) {
        Prospection p = findOrThrow(id);
        requireOwnerOrPrivileged(p, email, role);

        if (p.getState() != ProspectionState.NEW && p.getState() != ProspectionState.INTERESTED) {
            throw new InvalidStateException("Prospection", p.getState().name(), "NEW or INTERESTED");
        }

        p.setOwnerName(request.getOwnerName());
        p.setPhone(request.getPhone());
        p.setLeadSource(request.getLeadSource());
        p.setNationalId(request.getNationalId());
        p.setAddress(request.getAddress());
        p.setCity(request.getCity());
        p.setNotes(request.getNotes());

        Prospection saved = prospectionRepository.save(p);
        log.info("Updated prospection {}", id);
        return toResponse(saved);
    }

    @Transactional
    public ProspectionResponse markInterested(Long id, String email) {
        Prospection p = findOrThrow(id);
        requireOwner(p, email);

        if (p.getState() != ProspectionState.NEW) {
            throw new InvalidStateException("Prospection", p.getState().name(), "NEW");
        }

        p.setState(ProspectionState.INTERESTED);
        Prospection saved = prospectionRepository.save(p);
        log.info("Prospection {} marked as interested", id);
        return toResponse(saved);
    }

    @Transactional
    public ProspectionResponse markNotInterested(Long id, String rejectionReason, String email) {
        Prospection p = findOrThrow(id);
        requireOwner(p, email);

        if (p.getState() != ProspectionState.NEW && p.getState() != ProspectionState.INTERESTED) {
            throw new InvalidStateException("Prospection", p.getState().name(), "NEW or INTERESTED");
        }

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required when marking as not interested");
        }

        p.setState(ProspectionState.NOT_INTERESTED);
        p.setRejectionReason(rejectionReason);
        Prospection saved = prospectionRepository.save(p);
        log.info("Prospection {} marked as not interested", id);
        return toResponse(saved);
    }

    @Transactional
    public DemandeOuverture confirm(Long id, String email) {
        Prospection p = findOrThrow(id);
        requireOwner(p, email);

        if (p.getState() != ProspectionState.INTERESTED) {
            throw new InvalidStateException("Prospection", p.getState().name(), "INTERESTED");
        }

        User agent = resolveUser(email);

        DemandeOuverture demande = DemandeOuverture.builder()
                .reference(referenceGenerator.generateDemandeReference())
                .requestDate(java.time.LocalDate.now())
                .ownerName(p.getOwnerName())
                .ownerPhone(p.getPhone())
                .address(p.getAddress())
                .city(p.getCity())
                .state(DemandeState.DATA_COLLECTION)
                .prospection(p)
                .assignedAgent(agent)
                .build();

        DemandeOuverture savedDemande = demandeOuvertureRepository.save(demande);

        p.setState(ProspectionState.CONFIRMED);
        prospectionRepository.save(p);

        log.info("Prospection {} confirmed, created demande {}", id, savedDemande.getId());
        return savedDemande;
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Prospection findOrThrow(Long id) {
        return prospectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prospection", "id", id));
    }

    private void requireOwner(Prospection p, String email) {
        User user = resolveUser(email);
        if (!p.getAssignedAgent().getId().equals(user.getId())) {
            throw new ForbiddenActionException("Modify this prospection", "AGENT (owner)");
        }
    }

    private void requireOwnerOrPrivileged(Prospection p, String email, Role role) {
        if (role == Role.AGENT) {
            requireOwner(p, email);
        }
    }

    private ProspectionResponse toResponse(Prospection p) {
        ProspectionResponse r = new ProspectionResponse();
        r.setId(p.getId());
        r.setOwnerName(p.getOwnerName());
        r.setPhone(p.getPhone());
        r.setLeadSource(p.getLeadSource());
        r.setAssignedAgentId(p.getAssignedAgent().getId());
        r.setAssignedAgentName(p.getAssignedAgent().getName());
        r.setNationalId(p.getNationalId());
        r.setAddress(p.getAddress());
        r.setCity(p.getCity());
        r.setNotes(p.getNotes());
        r.setState(p.getState());
        r.setRejectionReason(p.getRejectionReason());
        return r;
    }
}
