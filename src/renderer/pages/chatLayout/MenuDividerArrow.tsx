import React from 'react'
// import PropTypes from 'prop-types';
import DoubleArrowSVG from '../../assets/svg/DoubleArrowSVG'

type MyComponentProps = {
	rotate?: boolean
	initRotate?: boolean
}

function MenuDividerArrow({ rotate, initRotate }: MyComponentProps) {
	return (
		<div className="flex cursor-pointer flex-col justify-center">
			<div className={!rotate ? 'rotate-180' : 'rotate-0'}>
				<div className={initRotate ? 'rotate-180' : ''}>{DoubleArrowSVG('17', '17')}</div>
			</div>
		</div>
	)
}

// MenuDividerArrow.propTypes = {
//   rotate: PropTypes.bool,
//   initRotate: PropTypes.bool,
// };

MenuDividerArrow.defaultProps = {
	rotate: false,
	initRotate: false,
}

export default MenuDividerArrow
