import React from 'react';
import PropTypes from 'prop-types';
import './EmptyContent.scss';

function EmptyContent({ className, children, minHeight, color }) {
  return (
    <div
      className={`empty-content-wrapper ${className} color-${color}`}
      style={{
        minHeight,
      }}
    >
      <div>{children}</div>
    </div>
  );
}

EmptyContent.defaultProps = {
  className: '',
  children: '데이터가 없습니다.',
  minHeight: '140px',
  color: 'gray',
};

EmptyContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  minHeight: PropTypes.string,
  color: PropTypes.string,
};

export default EmptyContent;
