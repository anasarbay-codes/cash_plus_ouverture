package com.cashplus.ouverture.dto.demande;

import com.cashplus.ouverture.model.enums.AgencyCategory;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemandeRequest {

    private String ownerName;

    private String ownerPhone;

    private String ownerEmail;

    private String address;

    private String city;

    private BigDecimal areaSqm;

    private AgencyCategory agencyCategory;
}
