package com.cashplus.ouverture.model;

import com.cashplus.ouverture.model.enums.LeadSource;
import com.cashplus.ouverture.model.enums.ProspectionState;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prospections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prospection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "lead_source", nullable = false)
    private LeadSource leadSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id", nullable = false)
    private User assignedAgent;

    @Column(name = "national_id")
    private String nationalId;

    private String address;

    private String city;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectionState state;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
