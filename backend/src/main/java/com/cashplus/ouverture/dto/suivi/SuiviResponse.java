package com.cashplus.ouverture.dto.suivi;

import com.cashplus.ouverture.model.enums.SuiviState;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuiviResponse {

    private Long id;
    private String reference;
    private String agencyName;
    private String address;
    private String city;
    private boolean legalDocumentsReady;
    private boolean fitOutReady;
    private boolean networkSetupReady;
    private boolean complianceChecked;
    private boolean installationDone;
    private LocalDate startDate;
    private SuiviState state;
    private Long demandeId;
    private Long assignedAgentId;
    private String assignedAgentName;
    private int photoCount;
    private List<SuiviPhotoResponse> photos;
}
