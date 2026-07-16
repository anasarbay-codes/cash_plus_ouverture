package com.cashplus.ouverture.dto.suivi;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuiviRequest {

    private String agencyName;

    private String address;

    private String city;

    private Boolean legalDocumentsReady;

    private Boolean fitOutReady;

    private Boolean networkSetupReady;

    private Boolean complianceChecked;

    private Boolean installationDone;
}
