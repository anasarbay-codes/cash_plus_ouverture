package com.cashplus.ouverture.dto.prospection;

import com.cashplus.ouverture.model.enums.LeadSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProspectionRequest {

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotNull(message = "Lead source is required")
    private LeadSource leadSource;

    private String nationalId;

    private String address;

    private String city;

    private String notes;
}
