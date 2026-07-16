package com.cashplus.ouverture.dto.suivi;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuiviPhotoResponse {

    private Long id;
    private String filePath;
    private LocalDateTime uploadedAt;
}
