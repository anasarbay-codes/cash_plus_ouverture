package com.cashplus.ouverture.repository;

import com.cashplus.ouverture.model.Prospection;
import com.cashplus.ouverture.model.enums.ProspectionState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProspectionRepository extends JpaRepository<Prospection, Long> {

    List<Prospection> findByAssignedAgentId(Long agentId);

    List<Prospection> findByAssignedAgentIdAndState(Long agentId, ProspectionState state);

    List<Prospection> findByState(ProspectionState state);

    Page<Prospection> findByAssignedAgentId(Long agentId, Pageable pageable);

    Page<Prospection> findByAssignedAgentIdAndState(Long agentId, ProspectionState state, Pageable pageable);

    Page<Prospection> findByState(ProspectionState state, Pageable pageable);

    boolean existsByOwnerNameAndNationalId(String ownerName, String nationalId);
}
