package com.cashplus.ouverture.repository;

import com.cashplus.ouverture.model.SuiviPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SuiviPhotoRepository extends JpaRepository<SuiviPhoto, Long> {

    List<SuiviPhoto> findBySuiviId(Long suiviId);

    long countBySuiviId(Long suiviId);
}
