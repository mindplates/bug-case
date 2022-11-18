package com.mindplates.bugcase.biz.testcase.service;

import com.mindplates.bugcase.biz.testcase.entity.TestcaseItemFile;
import com.mindplates.bugcase.biz.testcase.repository.TestcaseItemFileRepository;
import com.mindplates.bugcase.common.exception.ServiceException;
import com.mindplates.bugcase.common.util.FileUtil;
import com.mindplates.bugcase.framework.config.FileConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class TestcaseItemFileService {

    private final TestcaseItemFileRepository testcaseItemFileRepository;

    private final List<String> allowedExtensions;
    private final Path fileStorageLocation;

    private final FileUtil fileUtil;


    public TestcaseItemFileService(FileConfig fileConfig, TestcaseItemFileRepository testcaseItemFileRepository, FileUtil fileUtil) {
        this.fileUtil = fileUtil;
        this.testcaseItemFileRepository = testcaseItemFileRepository;

        this.fileStorageLocation = Paths.get(fileConfig.getUploadDir()).toAbsolutePath().normalize();
        this.allowedExtensions = Arrays.asList(fileConfig.getAllowedExtension().split(","));

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new ServiceException("image.upload.failed");
        }
    }

    public TestcaseItemFile createTestcaseItemFile(TestcaseItemFile projectFile) {
        testcaseItemFileRepository.save(projectFile);
        return projectFile;
    }

    public TestcaseItemFile selectTestcaseItemFile(Long projectId, Long testcaseId, Long imageId, String uuid) {
        return testcaseItemFileRepository.findByIdAndProjectIdAndTestcaseIdAndUuid(imageId, projectId, testcaseId, uuid).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
    }

    public void deleteProjectTestcaseItemFile(Long projectId) {

        List<TestcaseItemFile> projectTestcaseItemFiles = testcaseItemFileRepository.findAllByProjectId(projectId);

        projectTestcaseItemFiles.forEach((testcaseItemFile -> {
            Path filePath = this.fileStorageLocation.resolve(testcaseItemFile.getPath()).normalize();
            if (Files.exists(filePath)) {
                try {
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    // ignore
                }
            }
            testcaseItemFileRepository.delete(testcaseItemFile);
        }));
    }

    public String createImage(Long projectId, MultipartFile file) {
        if (!allowedExtensions.stream().anyMatch(p -> file.getOriginalFilename().endsWith(p))) {
            throw new ServiceException("file.error.uploadextension");
        }

        return fileUtil.storeFile(projectId, file);
    }


}
