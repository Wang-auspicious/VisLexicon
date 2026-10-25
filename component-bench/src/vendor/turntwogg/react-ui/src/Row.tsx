import React from 'react';
import classNames from 'classnames';
import css from 'styled-jsx/css';

import useTheme from './useTheme';
import { Theme } from './theme';

enum Alignment {
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center',
}

export interface Props {
  align?: Alignment;
  children: React.ReactElement[];
  className?: string;
  gutter: number | undefined;
}

export interface ChildProps {
  gutter: number;
}

const alignmentMap = {
  top: 'flex-start',
  bottom: 'flex-end',
  center: 'center',
};

function getStyles(gutter) {
  return css.resolve`
    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -${gutter}px;
      margin-left: -${gutter}px;
    }
    .row--align-top {
      align-items: ${alignmentMap[Alignment.Top]};
    }
    .row--align-center {
      align-items: ${alignmentMap[Alignment.Center]};
    }
    .row--align-bottom {
      align-items: ${alignmentMap[Alignment.Bottom]};
    }
  `;
}

const Row = ({
  align = Alignment.Top,
  children,
  className,
  gutter: gutterProp,
  ...rest
}: Props) => {
  const theme: Theme = useTheme();
  const gutter: number =
    typeof gutterProp !== 'undefined' ? gutterProp : theme.baseSpacingUnit / 2;
  const validChildren = React.Children.toArray(children).filter(child =>
    React.isValidElement(child),
  );
  const childProps: ChildProps = { gutter };

  const { className: cName, styles } = getStyles(gutter);

  return (
    <div
      className={classNames('row', cName, className, {
        [`row--align-${align}`]: align,
      })}
      {...rest}
    >
      {validChildren.map(child =>
        React.cloneElement(child as React.ReactElement, childProps),
      )}
      {styles}
    </div>
  );
};

export default Row;
