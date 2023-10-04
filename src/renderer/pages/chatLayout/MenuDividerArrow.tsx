import React from 'react';
// import PropTypes from 'prop-types';
import DoubleArrowSVG from '../svg/DoubleArrowSVG';

type MyComponentProps = {
  rotate?: boolean;
  initRotate?: boolean;
};

function MenuDividerArrow({ rotate, initRotate }: MyComponentProps) {
  return (
    <div className="flex flex-col justify-center cursor-pointer">
      <div className={!rotate ? 'rotate-180' : 'rotate-0'}>
        <div className={initRotate ? 'rotate-180' : ''}>
          {DoubleArrowSVG('17', '17')}
        </div>
      </div>
    </div>
  );
}

// MenuDividerArrow.propTypes = {
//   rotate: PropTypes.bool,
//   initRotate: PropTypes.bool,
// };

MenuDividerArrow.defaultProps = {
  rotate: false,
  initRotate: false,
};

export default MenuDividerArrow;
