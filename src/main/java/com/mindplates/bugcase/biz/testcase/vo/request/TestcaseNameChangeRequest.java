package com.mindplates.bugcase.biz.testcase.vo.request;

import lombok.Data;
import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotBlank;

@Data
public class TestcaseNameChangeRequest {

    @NotBlank
    @Length(min = 1, max = 100)
    private String name;

}
