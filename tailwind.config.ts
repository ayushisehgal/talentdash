import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: '#FF5A5F',
        'deep-text': '#222222',
        'body-text': '#484848',
        'muted-text': '#717171',
        border: '#EBEBEB',
        'app-bg': '#F7F7F7',
        'hover-surface': '#F2F2F2',
        'success-green': '#008A05',
        'warning-orange': '#FFB400',
        'error-red': '#D93025',
        'data-blue': '#0369A1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;