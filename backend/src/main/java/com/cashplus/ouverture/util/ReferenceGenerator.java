package com.cashplus.ouverture.util;

import com.cashplus.ouverture.repository.DemandeOuvertureRepository;
import org.springframework.stereotype.Component;

@Component
public class ReferenceGenerator {

    private static final String PREFIX = "DO-";

    private final DemandeOuvertureRepository demandeRepository;

    public ReferenceGenerator(DemandeOuvertureRepository demandeRepository) {
        this.demandeRepository = demandeRepository;
    }

    public String generateDemandeReference() {
        Long maxNumber = demandeRepository.findMaxReferenceNumber();
        long nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("%s%05d", PREFIX, nextNumber);
    }
}
