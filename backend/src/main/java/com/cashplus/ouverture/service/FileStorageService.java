package com.cashplus.ouverture.service;

import com.cashplus.ouverture.config.UploadConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final UploadConfig uploadConfig;

    public FileStorageService(UploadConfig uploadConfig) {
        this.uploadConfig = uploadConfig;
    }

    public String storeDemandePhoto(Long demandeId, MultipartFile file) {
        String subDir = uploadConfig.getDemandesSubdir();
        return storeFile(subDir, String.valueOf(demandeId), file);
    }

    public String storeSuiviPhoto(Long suiviId, MultipartFile file) {
        String subDir = uploadConfig.getSuivisSubdir();
        return storeFile(subDir, String.valueOf(suiviId), file);
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadConfig.getBaseDir(), filePath);
            Files.deleteIfExists(path);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
    }

    private String storeFile(String subDir, String entityId, MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + extension;

            Path targetDir = Paths.get(uploadConfig.getBaseDir(), subDir, entityId);
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = subDir + "/" + entityId + "/" + filename;
            log.info("Stored file: {}", relativePath);
            return relativePath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
        }
    }
}
