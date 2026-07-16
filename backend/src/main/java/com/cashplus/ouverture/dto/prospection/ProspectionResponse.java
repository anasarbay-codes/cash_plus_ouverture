package com.cashplus.ouverture.dto.prospection;

import com.cashplus.ouverture.model.enums.LeadSource;
import com.cashplus.ouverture.model.enums.ProspectionState;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProspectionResponse {

    private Long id;
    private String ownerName;
    private String phone;
    private LeadSource leadSource;
    private Long assignedAgentId;
    private String assignedAgentName;
    private String nationalId;
    private String address;
    private String city;
    private String notes;
    private ProspectionState state;
    private String rejectionReason;
}
