package com.cashplus.ouverture.repository;

import com.cashplus.ouverture.model.DemandeOuverture;
import com.cashplus.ouverture.model.enums.DemandeState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DemandeOuvertureRepository extends JpaRepository<DemandeOuverture, Long> {

    List<DemandeOuverture> findByAssignedAgentId(Long agentId);

    List<DemandeOuverture> findByAssignedAgentIdAndState(Long agentId, DemandeState state);

    List<DemandeOuverture> findByState(DemandeState state);

    Page<DemandeOuverture> findByAssignedAgentId(Long agentId, Pageable pageable);

    Page<DemandeOuverture> findByAssignedAgentIdAndState(Long agentId, DemandeState state, Pageable pageable);

    Page<DemandeOuverture> findByState(DemandeState state, Pageable pageable);

    Optional<DemandeOuverture> findByProspectionId(Long prospectionId);

    @Query("SELECT d FROM DemandeOuverture d LEFT JOIN FETCH d.photos WHERE d.id = :id")
    Optional<DemandeOuverture> findByIdWithPhotos(Long id);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(d.reference, 4) AS long)), 0) FROM DemandeOuverture d")
    Long findMaxReferenceNumber();
}
