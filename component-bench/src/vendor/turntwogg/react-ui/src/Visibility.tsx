import React from 'react';
import classNames from 'classnames';
import css from 'styled-jsx/css';

import useTheme from './useTheme';
import { Theme } from './theme';

const getResponsiveStyles = (theme: Theme) => {
  const bps = Object.keys(theme.breakpoints);
  return bps.map(
    bp => css.resolve`
      @media (min-width: ${theme.breakpoints[bp]}px) {
        .visibility-visible-${bp} {
          position: static;
          width: auto;
          height: auto;
          margin: initial;
          clip: initial;
        }

        .visibility-hidden-${bp} {
          border: 0;
          clip: rect(0 0 0 0);
          height: 1px;
          margin: -1px;
          overflow: hidden;
          padding: 0;
          position: absolute;
          width: 1px;
          white-space: nowrap;
        }
      }
    `,
  );
};

export interface Props {
  children: React.ReactNode;
  hidden: boolean;
  visible?: string[];
}

const Visibility = ({
  children,
  hidden = true,
  visible = [],
  ...rest
}: Props) => {
  const theme: Theme = useTheme();
  const hiddenClass = Array.isArray(hidden)
    ? hidden
        .filter(h => theme.breakpoints.hasOwnProperty(h))
        .map(bp => `visibility-hidden-${bp}`)
        .join(' ')
    : 'visibility-hidden';
  const visibleClass = Array.isArray(visible)
    ? visible
        .filter(v => theme.breakpoints.hasOwnProperty(v))
        .map(bp => `visibility-visible-${bp}`)
        .join(' ')
    : 'visibility-visible';
  const resolved = getResponsiveStyles(theme);
  const rStyles = resolved.map(r => r.styles);
  const rClasses = resolved.map(r => r.className).join(' ');

  return (
    <span
      className={classNames('visibility', hiddenClass, visibleClass, rClasses)}
    >
      {children}
      <style jsx>{`
        .visibility-hidden {
          border: 0;
          clip: rect(0 0 0 0);
          height: 1px;
          margin: -1px;
          overflow: hidden;
          padding: 0;
          position: absolute;
          width: 1px;
          white-space: nowrap;
        }
      `}</style>
      {rStyles.map(style => style)}
    </span>
  );
};

export default Visibility;
