import React, { useEffect, useState } from 'react';
import { Button, FlexibleLayout, Page, PageContent, PageTitle } from '@/components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import dialogUtil from '@/utils/dialogUtil';
import { ITEM_TYPE, MESSAGE_CATEGORY } from '@/constants/constants';
import ProjectService from '@/services/ProjectService';
import useStores from '@/hooks/useStores';
import TestrunService from '@/services/TestrunService';
import testcaseUtil from '@/utils/testcaseUtil';
import TestcaseNavigator from '@/pages/spaces/projects/ProjectTestcaseInfoPage/TestcaseNavigator/TestcaseNavigator';
import TestRunTestcaseManager from '@/pages/spaces/projects/testruns/TestrunInfoPage/TestRunTestcaseManager/TestRunTestcaseManager';
import './TestrunInfoPage.scss';

const start = new Date();
start.setHours(start.getHours() + 1);
start.setMinutes(0);
start.setSeconds(0);
start.setMilliseconds(0);

const end = new Date();
end.setHours(end.getHours() + 2);
end.setMinutes(0);
end.setSeconds(0);
end.setMilliseconds(0);

function TestrunInfoPage() {
  const { t } = useTranslation();
  const { projectId, spaceCode, testrunId } = useParams();

  const {
    userStore: { user },
  } = useStores();

  const navigate = useNavigate();

  const [min, setMin] = useState(false);

  const [countSummary, setCountSummary] = useState({
    testcaseGroupCount: 0,
    testcaseCount: 0,
  });

  const [testcaseGroups, setTestcaseGroups] = useState([]);

  const [project, setProject] = useState(null);

  const [contentLoading, setContentLoading] = useState(false);

  const [content, setContent] = useState(null);

  const [userFilter, setUserFilter] = useState('');

  const [testrun, setTestrun] = useState({
    seqId: '',
    name: '',
    description: '',
    testrunUsers: [],
    testcaseGroups: [],
    startDateTime: start.getTime(),
    endDateTime: end.getTime(),
    opened: false,
    totalTestcaseCount: true,
    passedTestcaseCount: true,
    failedTestcaseCount: true,
  });

  const [selectedItemInfo, setSelectedItemInfo] = useState({
    id: null,
    type: null,
    time: null,
  });

  const getProject = () => {
    ProjectService.selectProjectInfo(spaceCode, projectId, info => {
      setProject(info);
    });
  };

  useEffect(() => {
    getProject();
  }, [projectId]);

  const getTestrunInfo = () => {
    TestrunService.selectTestrunInfo(spaceCode, projectId, testrunId, info => {
      if (!project) {
        return;
      }

      setTestrun(info);

      const filteredTestcaseGroups = info.testcaseGroups?.map(d => {
        return {
          ...d,
          testcases:
            d.testcases?.filter(testcase => {
              if (userFilter === '') {
                return true;
              }

              return String(testcase.testerId) === String(userFilter);
            }) || [],
        };
      });

      setCountSummary({
        testcaseGroupCount: filteredTestcaseGroups?.length || 0,
        testcaseCount: filteredTestcaseGroups?.reduce((count, next) => {
          return count + (next?.testcases?.length || 0);
        }, 0),
      });

      const groups = testcaseUtil.getTestcaseTreeData(filteredTestcaseGroups, 'testcaseGroupId');
      setTestcaseGroups(groups);

      setUserFilter(userFilter);
    });
  };

  useEffect(() => {
    getTestrunInfo();
  }, [project, testrunId]);

  useEffect(() => {
    if (!project) {
      return;
    }

    const filteredTestcaseGroups = testrun.testcaseGroups?.map(d => {
      return {
        ...d,
        testcases: d.testcases.filter(testcase => {
          if (userFilter === '') {
            return true;
          }

          return String(testcase.testerId) === String(userFilter);
        }),
      };
    });

    setCountSummary({
      testcaseGroupCount: filteredTestcaseGroups?.length || 0,
      testcaseCount: filteredTestcaseGroups?.reduce((count, next) => {
        return count + (next?.testcases?.length || 0);
      }, 0),
    });

    const groups = testcaseUtil.getTestcaseTreeData(filteredTestcaseGroups, 'testcaseGroupId');
    setTestcaseGroups(groups);
  }, [project, userFilter]);

  const getTestcase = testrunTestcaseGroupTestcaseId => {
    setContentLoading(true);

    const testcaseGroup = testrun?.testcaseGroups.find(d => d.testcases?.find(testcase => testcase.id === testrunTestcaseGroupTestcaseId));

    TestrunService.selectTestrunTestcaseGroupTestcase(
      spaceCode,
      projectId,
      testrunId,
      testcaseGroup.id,
      testrunTestcaseGroupTestcaseId,
      info => {
        setTimeout(() => {
          setContentLoading(false);
        }, 200);
        setContent(info);
      },
      () => {
        setContentLoading(false);
      },
    );
  };

  const getContent = () => {
    if (selectedItemInfo.type === ITEM_TYPE.TESTCASE) {
      getTestcase(selectedItemInfo.id);
    }
  };

  useEffect(() => {
    if (selectedItemInfo.id) {
      getContent();
    } else {
      setContent(null);
    }
  }, [selectedItemInfo.id]);

  const onDelete = () => {
    dialogUtil.setConfirm(
      MESSAGE_CATEGORY.WARNING,
      t('???????????? ??????'),
      <div>{t(`"${testrun.name}" ???????????? ??? ??????????????? ????????? ?????? ????????? ???????????????. ?????????????????????????`)}</div>,
      () => {
        TestrunService.deleteTestrunInfo(spaceCode, projectId, testrunId, () => {
          navigate(`/spaces/${spaceCode}/projects/${projectId}/testruns`);
        });
      },
      null,
      t('??????'),
    );
  };

  const onClosed = () => {
    dialogUtil.setConfirm(
      MESSAGE_CATEGORY.WARNING,
      t('???????????? ??????'),
      <div>{t(`"${testrun.name}" ??????????????? ???????????????. ?????????????????????????`)}</div>,
      () => {
        TestrunService.updateTestrunStatusClosed(spaceCode, projectId, testrunId, () => {
          navigate(`/spaces/${spaceCode}/projects/${projectId}/testruns`);
        });
      },
      null,
      t('??????'),
    );
  };

  const onChangeComment = (id, comment, handler) => {
    TestrunService.updateTestrunComment(
      spaceCode,
      projectId,
      testrunId,
      content.testrunTestcaseGroupId,
      content.id,
      {
        id,
        comment,
        testrunTestcaseGroupTestcaseId: content.id,
      },
      info => {
        const nextContent = { ...content };

        if (!nextContent.comments) {
          nextContent.comments = [];
        }

        nextContent.comments.push(info);
        if (handler) {
          handler();
        }

        setContent(nextContent);
      },
    );
  };

  const onDeleteComment = id => {
    TestrunService.deleteTestrunComment(spaceCode, projectId, testrunId, content.testrunTestcaseGroupId, content.id, id, () => {
      const nextContent = { ...content };
      const nextComments = nextContent.comments.slice(0);

      if (nextComments) {
        const index = nextComments.findIndex(comment => comment.id === id);
        nextComments.splice(index, 1);
        nextContent.comments = nextComments;

        setContent(nextContent);
      }
    });
  };

  const createTestrunImage = (id, name, size, type, file) => {
    return TestrunService.createImage(spaceCode, projectId, testrunId, name, size, type, file);
  };

  const onSaveTestResultItems = nextContent => {
    console.log(1, nextContent);
    TestrunService.updateTestrunResultItems(
      spaceCode,
      projectId,
      testrunId,
      nextContent?.testrunTestcaseGroupId || content.testrunTestcaseGroupId,
      nextContent.id || content.id,
      {
        testrunTestcaseGroupTestcaseItemRequests: nextContent ? nextContent.testrunTestcaseItems : content.testrunTestcaseItems,
      },
      result => {
        console.log(testrun);
        console.log(result);
        getTestrunInfo();
      },
    );
  };

  const onSaveTestResultItem = target => {
    console.log(target);
    TestrunService.updateTestrunResultItem(spaceCode, projectId, testrunId, target.testrunTestcaseGroupId, target.testrunTestcaseGroupTestcaseId, target.testcaseTemplateItemId, target, result => {
      console.log(result);
      getTestrunInfo();
    });
  };

  const onSaveTestResult = testResult => {
    TestrunService.updateTestrunResult(spaceCode, projectId, testrunId, content.testrunTestcaseGroupId, content.id, testResult, () => {
      getTestrunInfo();
    });
  };

  const onSaveTester = testerId => {
    TestrunService.updateTestrunTester(spaceCode, projectId, testrunId, content.testrunTestcaseGroupId, content.id, testerId, () => {
      getTestrunInfo();
    });
  };

  return (
    <Page className="testrun-info-page-wrapper" list wide>
      <PageTitle
        control={
          <div>
            <Button size="sm" color="warning" onClick={onClosed}>
              {t('???????????? ??????')}
            </Button>
            <Button size="sm" color="danger" onClick={onDelete}>
              {t('???????????? ??????')}
            </Button>
          </div>
        }
      >
        {testrun.name}
      </PageTitle>
      <PageContent className="page-content">
        <FlexibleLayout
          layoutOptionKey={['testrun', 'testrun-layout', 'width']}
          min={min}
          setMin={setMin}
          left={
            <TestcaseNavigator
              user={user}
              users={project?.users}
              testcaseGroups={testcaseGroups}
              showTestResult
              enableDrag={false}
              selectedItemInfo={selectedItemInfo}
              onSelect={setSelectedItemInfo}
              min={min}
              setMin={setMin}
              countSummary={countSummary}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
            />
          }
          right={
            selectedItemInfo.id && (
              <TestRunTestcaseManager
                contentLoading={contentLoading}
                content={content || {}}
                testcaseTemplates={project?.testcaseTemplates}
                setContent={d => {
                  setContent(d);
                }}
                onSave={onSaveTestResultItems}
                onSaveTestResultItem={onSaveTestResultItem}
                onSaveResult={onSaveTestResult}
                onSaveTester={onSaveTester}
                onSaveComment={onChangeComment}
                onDeleteComment={onDeleteComment}
                users={project?.users.map(u => {
                  return {
                    ...u,
                    id: u.userId,
                  };
                })}
                user={user}
                createTestrunImage={createTestrunImage}
              />
            )
          }
        />
      </PageContent>
    </Page>
  );
}

TestrunInfoPage.defaultProps = {};

TestrunInfoPage.propTypes = {};

export default TestrunInfoPage;
