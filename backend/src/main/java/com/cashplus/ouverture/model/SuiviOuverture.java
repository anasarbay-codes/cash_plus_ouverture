package com.cashplus.ouverture.model;

import com.cashplus.ouverture.model.enums.SuiviState;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suivis_ouverture")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuiviOuverture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(name = "agency_name")
    private String agencyName;

    private String address;

    private String city;

    @Column(name = "legal_documents_ready")
    private boolean legalDocumentsReady;

    @Column(name = "fit_out_ready")
    private boolean fitOutReady;

    @Column(name = "network_setup_ready")
    private boolean networkSetupReady;

    @Column(name = "compliance_checked")
    private boolean complianceChecked;

    @Column(name = "installation_done")
    private boolean installationDone;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SuiviState state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id")
    private DemandeOuverture demande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id", nullable = false)
    private User assignedAgent;

    @OneToMany(mappedBy = "suivi", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SuiviPhoto> photos = new ArrayList<>();
}
