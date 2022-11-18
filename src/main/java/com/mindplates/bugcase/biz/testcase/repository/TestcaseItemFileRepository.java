package com.mindplates.bugcase.biz.testcase.repository;

import com.mindplates.bugcase.biz.testcase.entity.TestcaseItemFile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestcaseItemFileRepository extends JpaRepository<TestcaseItemFile, Long> {

  Optional<TestcaseItemFile> findByProjectIdAndId(Long projectId, Long imageId);

  Optional<TestcaseItemFile> findByIdAndProjectIdAndTestcaseIdAndUuid(Long imageId, Long projectId, Long testcaseId, String uuid);

  @Modifying
  @Query("DELETE FROM TestcaseItemFile tif WHERE tif.testcase.id = :testcaseId")
  void deleteByTestcaseId(@Param("testcaseId") Long testcaseId);

  @Modifying
  @Query("DELETE FROM TestcaseItemFile tif WHERE tif.project.id = :projectId")
  void deleteByProjectId(@Param("projectId") Long projectId);

  @Modifying
  @Query("DELETE FROM TestcaseItemFile tif WHERE tif.testcase.id IN (SELECT t.id from Testcase t where t.testcaseGroup.id in (:ids))")
  void deleteByTestcaseGroupIds(@Param("ids") List<Long> ids);

  List<TestcaseItemFile> findAllByTestcaseId(Long testcaseId);

  List<TestcaseItemFile> findAllByProjectId(Long projectId);

  List<TestcaseItemFile> findAllByTestcaseTestcaseGroupIdIn(List<Long> ids);


}

