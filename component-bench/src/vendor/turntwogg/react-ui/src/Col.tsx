import React from 'react';
import classNames from 'classnames';
import css from 'styled-jsx/css';

import useTheme from './useTheme';
import { Theme } from './theme';

interface ResolveProps {
  className: string;
  styles: string;
}

const getWidths = (size: number): string => `
  flex-basis: ${(size / 12) * 100}%;
  max-width: ${(size / 12) * 100}%;
`;

const getResponsiveStyles = (theme: Theme): ResolveProps[] => {
  const bps = Object.keys(theme.breakpoints);
  return bps.map(
    bp => css.resolve`
      @media (min-width: ${theme.breakpoints[bp]}px) {
        .col--${bp}-1 {
          ${getWidths(1)}
        }
        .col--${bp}-2 {
          ${getWidths(2)}
        }
        .col--${bp}-3 {
          ${getWidths(3)}
        }
        .col--${bp}-4 {
          ${getWidths(4)}
        }
        .col--${bp}-5 {
          ${getWidths(5)}
        }
        .col--${bp}-6 {
          ${getWidths(6)}
        }
        .col--${bp}-7 {
          ${getWidths(7)}
        }
        .col--${bp}-8 {
          ${getWidths(8)}
        }
        .col--${bp}-9 {
          ${getWidths(9)}
        }
        .col--${bp}-10 {
          ${getWidths(10)}
        }
        .col--${bp}-11 {
          ${getWidths(11)}
        }
        .col--${bp}-12 {
          ${getWidths(12)}
        }
      }
    `,
  );
};

export interface Props {
  children: React.ReactNode;
  className?: string;
  gutter?: number;
  sizes?: {
    [key: string]: number;
  };
}

interface StyleProps {
  key: number;
}

const Col = ({ children, className, gutter, sizes = {}, ...rest }: Props) => {
  const theme: Theme = useTheme();
  const bps = Object.keys(sizes).filter(bp =>
    theme.breakpoints.hasOwnProperty(bp),
  );
  const cNames: string = bps.map(bp => `col--${bp}-${sizes[bp]}`).join(' ');
  const resolved: ResolveProps[] = getResponsiveStyles(theme);
  const rNames: string = resolved.map(r => r.className).join(' ');
  const rStyles: string[] = resolved.map(r => r.styles);
  return (
    <div className={classNames('col', className, cNames, rNames)} {...rest}>
      {children}
      <style jsx>{`
        .col {
          flex: 1 0 100%;
          max-width: 100%;
          margin-bottom: ${gutter * 2}px;
          padding: 0 ${gutter}px;
          box-sizing: border-box;
        }
      `}</style>
      {rStyles.map((rStyle: unknown, key) =>
        React.cloneElement(rStyle as React.ReactElement<StyleProps>, { key }),
      )}
    </div>
  );
};

export default Col;
