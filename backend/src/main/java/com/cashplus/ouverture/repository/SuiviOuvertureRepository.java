package com.cashplus.ouverture.repository;

import com.cashplus.ouverture.model.SuiviOuverture;
import com.cashplus.ouverture.model.enums.SuiviState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SuiviOuvertureRepository extends JpaRepository<SuiviOuverture, Long> {

    List<SuiviOuverture> findByAssignedAgentId(Long agentId);

    List<SuiviOuverture> findByAssignedAgentIdAndState(Long agentId, SuiviState state);

    List<SuiviOuverture> findByState(SuiviState state);

    Page<SuiviOuverture> findByAssignedAgentId(Long agentId, Pageable pageable);

    Page<SuiviOuverture> findByAssignedAgentIdAndState(Long agentId, SuiviState state, Pageable pageable);

    Page<SuiviOuverture> findByState(SuiviState state, Pageable pageable);

    Optional<SuiviOuverture> findByDemandeId(Long demandeId);

    @Query("SELECT s FROM SuiviOuverture s LEFT JOIN FETCH s.photos WHERE s.id = :id")
    Optional<SuiviOuverture> findByIdWithPhotos(Long id);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(s.reference, 4) AS long)), 0) FROM SuiviOuverture s")
    Long findMaxReferenceNumber();
}
