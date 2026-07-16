package com.cashplus.ouverture.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class UploadConfig {

    private static final Logger log = LoggerFactory.getLogger(UploadConfig.class);

    @Value("${app.upload.base-dir}")
    private String baseDir;

    @Value("${app.upload.demandes-subdir}")
    private String demandesSubdir;

    @Value("${app.upload.suivis-subdir}")
    private String suivisSubdir;

    @PostConstruct
    public void init() {
        try {
            Path base = Paths.get(baseDir);
            Files.createDirectories(base.resolve(demandesSubdir));
            Files.createDirectories(base.resolve(suivisSubdir));
            log.info("Upload directories initialized at: {}", base.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to initialize upload directories", e);
            throw new RuntimeException("Could not create upload directories", e);
        }
    }

    public String getBaseDir() {
        return baseDir;
    }

    public String getDemandesSubdir() {
        return demandesSubdir;
    }

    public String getSuivisSubdir() {
        return suivisSubdir;
    }
}
