import React, { useEffect, useState } from 'react';
import { Button, PageContent, TextArea } from '@/components';
import { Link } from 'react-router-dom';
import SpaceService from '@/services/SpaceService';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import './InaccessibleContent.scss';

function SpaceInfoPage({ space, onRefresh }) {
  const { id } = useParams();

  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(space?.applicant?.message || '');
  }, [space?.id]);

  const onJoin = () => {
    SpaceService.createSpaceApplicant(id, { message }, () => {
      onRefresh();
    });
  };

  const onCancelJoin = () => {
    SpaceService.deleteSpaceApplicant(id, () => {
      onRefresh();
    });
  };

  const onRequestAgain = () => {
    SpaceService.createSpaceApplicant(id, { message }, () => {
      onRefresh();
    });
  };

  return (
    <PageContent className="inaccessible-content-wrapper">
      {space?.allowSearch && (
        <div className="accessible">
          <div>
            <div className="space-info">
              <div className="space">
                <span>SPACE</span>
              </div>
              <div className="name">{space.name}</div>
              <div className="code">{space.code}</div>
            </div>
            {space.allowAutoJoin && (
              <div className="allow-auto-join">
                <div className="msg">
                  {space.name} [{space.code}] 스페이스는 누구나 바로 가입할 수 있습니다. <br />
                  아래 버튼을 클릭하여, 스페이스에 참여할 수 있습니다.
                </div>
                <div>
                  <Button onClick={onJoin}>
                    &#39;{space.name} [{space.code}]&#39; 스페이스 가입
                  </Button>
                </div>
              </div>
            )}
            {!space.allowAutoJoin && !space.applicant && (
              <div className="need-approve-join">
                <div className="msg">
                  {space.name} [{space.code}] 스페이스에 참여하기 위해서는 스페이스 관리자의 승인이 필요합니다. <br />
                  아래 정보를 입력하여, 스페이스 가입 요청을 할 수 있습니다.
                </div>
                <div className="join-info">
                  <div className="message-content">
                    <TextArea placeholder="관리자에게 전달할 메세지를 입력할 수 있습니다." value={message} rows={4} onChange={setMessage} />
                  </div>
                  <div>
                    <Button onClick={onJoin}>
                      &#39;{space.name} [{space.code}]&#39; 스페이스 가입 요청
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!space.allowAutoJoin && space.applicant && (space.applicant.approvalStatusCode === 'REQUEST' || space.applicant.approvalStatusCode === 'REQUEST_AGAIN') && (
              <div className="requesting-join">
                <div className="msg">스페이스 관리자의 승인 후 스페이스에 참여 할 수 있습니다.</div>
                <div className="request-info">
                  <div className="space-admin-list">
                    <div className="title">스페이스 관리자</div>
                    <ul>
                      {space.admins.map(admin => {
                        return (
                          <li key={admin.id}>
                            <div className="admin">{admin.email}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <div>
                  <Button onClick={onCancelJoin}>가입 요청 취소</Button>
                </div>
              </div>
            )}
            {!space.allowAutoJoin && space.applicant && space.applicant.approvalStatusCode === 'REJECTED' && (
              <div className="requesting-reject">
                <div className="msg">스페이스 참여가 거절되었습니다.</div>
                <div className="request-info">
                  <div className="space-admin-list">
                    <div className="title">스페이스 관리자</div>
                    <ul>
                      {space.admins.map(admin => {
                        return (
                          <li key={admin.id}>
                            <div className="admin">{admin.email}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <div className="message-content">
                  <TextArea placeholder="관리자에게 전달할 메세지를 입력할 수 있습니다." value={message} rows={4} onChange={setMessage} />
                </div>
                <div className="request-button">
                  <Button onClick={onCancelJoin}>가입 요청 취소</Button>
                  <Button onClick={onRequestAgain}>다시 참여 요청</Button>
                </div>
              </div>
            )}
            <div className="home">
              <Link to="/">
                <i className="fa-solid fa-house" />
              </Link>
            </div>
          </div>
        </div>
      )}
      {!space?.allowSearch && (
        <div className="inaccessible">
          <div>
            <div className="confidential">
              <span>confidential</span>
            </div>
            <div>스페이스 관리자에 의해 접근이 허용되지 않은 스페이스입니다.</div>
            <div className="home">
              <Link to="/">
                <i className="fa-solid fa-house" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageContent>
  );
}

SpaceInfoPage.defaultProps = {
  space: {},
};

SpaceInfoPage.propTypes = {
  space: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    code: PropTypes.string,
    allowSearch: PropTypes.bool,
    allowAutoJoin: PropTypes.bool,
    admins: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      }),
    ),
    applicant: PropTypes.shape({
      message: PropTypes.string,
      approvalStatusCode: PropTypes.string,
    }),
  }),
  onRefresh: PropTypes.func.isRequired,
};

export default SpaceInfoPage;
