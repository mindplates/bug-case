package com.mindplates.bugcase.biz.testcase.repository;

import com.mindplates.bugcase.biz.testcase.entity.TestcaseGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TestcaseGroupRepository extends JpaRepository<TestcaseGroup, Long> {

    List<TestcaseGroup> findAllByProjectIdAndParentId(Long projectId, Long parentId);

    boolean existsByIdAndProjectId(Long id, Long projectId);

    Optional<TestcaseGroup> findByIdAndProjectId(Long id, Long projectId);

    @Modifying
    @Query("DELETE FROM TestcaseGroup tg WHERE tg.id = :id")
    void deleteById(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM TestcaseGroup tg WHERE tg.id IN (:ids)")
    void deleteByIds(@Param("ids") List<Long> ids);


}

