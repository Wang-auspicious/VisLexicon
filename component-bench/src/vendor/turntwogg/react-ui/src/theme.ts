export interface Theme {
  baseFontSize: number;
  baseSpacingUnit: number;
  maxWidth: number;
  fonts: {
    [key: string]: string;
  };
  breakpoints: {
    [key: string]: number;
  };
  colors: {
    [key: string]: string;
  };
}

const theme: Theme = {
  baseFontSize: 16,
  baseSpacingUnit: 24,
  maxWidth: 1200,
  fonts: {
    primary: "'Helvetica', sans-serif",
    secondary: 'Georgia, serif',
  },
  breakpoints: {
    sm: 600,
    m: 900,
    l: 1200,
  },
  colors: {
    primary: '#2196F3', // Material Blue 500
    secondary: '#81C784', // Material Green 300
  },
};

export default theme;
