package com.cashplus.ouverture.repository;

import com.cashplus.ouverture.model.DemandePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandePhotoRepository extends JpaRepository<DemandePhoto, Long> {

    List<DemandePhoto> findByDemandeId(Long demandeId);

    long countByDemandeId(Long demandeId);

    void deleteByDemandeIdAndId(Long demandeId, Long photoId);
}
