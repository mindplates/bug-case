import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TestcaseGroupPropTypes } from '@/proptypes';
import './TestcaseSelectorGroup.scss';

function TestcaseSelectorGroup({ testcaseGroup, selected, onClick, selectedTestcaseGroups }) {
  const [opened, setOpened] = useState(true);
  const hasChild = testcaseGroup.testcases?.length > 0;

  return (
    <div
      className="testcase-selector-group-wrapper"
      style={{
        marginLeft: `${testcaseGroup.depth}rem`,
      }}
    >
      <div
        className={`group-info ${selected ? 'selected' : ''}`}
        onClick={() => {
          onClick(testcaseGroup.id, null);
        }}
      >
        <div>
          <div
            className="tree-control"
            onClick={e => {
              e.stopPropagation();
              setOpened(!opened);
            }}
          >
            {hasChild && !opened && <i className="fa-regular fa-square-plus" />}
            {hasChild && opened && <i className="fa-regular fa-square-minus" />}
            {!hasChild && <i className="fa-solid fa-minus" />}
          </div>
        </div>
        <div>
          {selected && <i className="fa-solid fa-circle-check" />}
          {!selected && <i className="fa-regular fa-circle-check" />}
        </div>
        <div>{testcaseGroup.name}</div>
      </div>
      {opened && (
        <div className="testcase-list">
          <ul>
            {testcaseGroup.testcases.map(testcase => {
              const selectedTestcaseGroup = selectedTestcaseGroups.find(i => i.testcaseGroupId === testcaseGroup.id);
              const testcaseSelected = selectedTestcaseGroup?.testcases?.findIndex(i => i.testcaseId === testcase.id) > -1;

              return (
                <li className={testcaseSelected ? 'selected' : ''} key={testcase.id}>
                  <div
                    className="testcase-info"
                    onClick={() => {
                      onClick(testcaseGroup.id, testcase.id);
                    }}
                  >
                    <div>
                      <div className="line-1" />
                      <div className="line-2" />
                    </div>
                    <div>
                      {testcaseSelected && <i className="fa-solid fa-circle-check" />}
                      {!testcaseSelected && <i className="fa-regular fa-circle-check" />}
                    </div>
                    <div>{testcase.name}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {testcaseGroup.children?.map(d => {
        const childrenSelected = selectedTestcaseGroups.findIndex(i => i.testcaseGroupId === d.id) > -1;
        return <TestcaseSelectorGroup key={d.id} testcaseGroup={d} selected={childrenSelected} onClick={onClick} selectedTestcaseGroups={selectedTestcaseGroups} />;
      })}
    </div>
  );
}

TestcaseSelectorGroup.defaultProps = {
  testcaseGroup: {},
  selected: false,
  selectedTestcaseGroups: [],
};

TestcaseSelectorGroup.propTypes = {
  testcaseGroup: TestcaseGroupPropTypes,
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  selectedTestcaseGroups: PropTypes.arrayOf(
    PropTypes.shape({
      testcaseGroupId: PropTypes.number,
      testcases: PropTypes.arrayOf(
        PropTypes.shape({
          testcaseId: PropTypes.number,
        }),
      ),
    }),
  ),
};

export default TestcaseSelectorGroup;
