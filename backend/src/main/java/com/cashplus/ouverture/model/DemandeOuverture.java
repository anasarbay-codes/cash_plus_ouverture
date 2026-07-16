package com.cashplus.ouverture.model;

import com.cashplus.ouverture.model.enums.AgencyCategory;
import com.cashplus.ouverture.model.enums.DemandeState;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demandes_ouverture")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeOuverture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_phone")
    private String ownerPhone;

    @Column(name = "owner_email")
    private String ownerEmail;

    private String address;

    private String city;

    @Column(name = "area_sqm")
    private BigDecimal areaSqm;

    @Enumerated(EnumType.STRING)
    @Column(name = "agency_category")
    private AgencyCategory agencyCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DemandeState state;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospection_id")
    private Prospection prospection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id", nullable = false)
    private User assignedAgent;

    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DemandePhoto> photos = new ArrayList<>();
}
