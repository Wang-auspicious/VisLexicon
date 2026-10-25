import React from 'react';

import ThemeContext from './ThemeContext';

import defaultTheme, { Theme } from './theme';

export interface Props {
  children: React.ReactNode;
  theme?: object; // should this be Theme? I really don't care what it is, it doesn't have to be exactly the theme shape
}

const ThemeProvider = ({ children, theme = {} }: Props) => {
  return (
    <ThemeContext.Provider value={{ ...defaultTheme, ...theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
