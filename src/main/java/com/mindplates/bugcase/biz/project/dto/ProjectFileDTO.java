package com.mindplates.bugcase.biz.project.dto;

import com.mindplates.bugcase.common.code.FileSourceTypeCode;
import com.mindplates.bugcase.common.dto.CommonDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ProjectFileDTO extends CommonDTO {

    private Long id;
    private ProjectDTO project;
    private String name;
    private String type;
    private String path;
    private Long size;
    private String uuid;
    private FileSourceTypeCode fileSourceType;
    private Long fileSourceId;
}
