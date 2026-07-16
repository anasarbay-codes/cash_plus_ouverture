package com.cashplus.ouverture.dto.demande;

import com.cashplus.ouverture.model.enums.AgencyCategory;
import com.cashplus.ouverture.model.enums.DemandeState;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemandeResponse {

    private Long id;
    private String reference;
    private LocalDate requestDate;
    private LocalDate submittedDate;
    private String ownerName;
    private String ownerPhone;
    private String ownerEmail;
    private String address;
    private String city;
    private BigDecimal areaSqm;
    private AgencyCategory agencyCategory;
    private DemandeState state;
    private String rejectionReason;
    private Long prospectionId;
    private Long assignedAgentId;
    private String assignedAgentName;
    private int photoCount;
    private List<PhotoResponse> photos;
}
