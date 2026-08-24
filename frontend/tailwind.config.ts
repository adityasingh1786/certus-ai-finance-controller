import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base Page & Surface (Sterling White Palette)
        page: '#FAFAF9',
        surface: '#FFFFFF',
        'surface-subtle': '#F4F4F5',
        'surface-raised': '#FFFFFF',

        // Typography
        'ink-primary': '#111827',
        'ink-secondary': '#4B5563',
        'ink-muted': '#9CA3AF',

        // Sterling Brand Red
        sterling: {
          DEFAULT: '#E8384F',
          hover: '#D02B41',
          light: '#FEE2E2',
          border: '#FECACA',
          dark: '#991B1B',
        },

        // Status Badges (High Legibility: Dark text on light tint)
        status: {
          matched: {
            bg: '#ECFDF5',
            text: '#065F46',
            border: '#A7F3D0',
          },
          mismatched: {
            bg: '#FEF2F2',
            text: '#991B1B',
            border: '#FECACA',
          },
          missing: {
            bg: '#FFFBEB',
            text: '#92400E',
            border: '#FDE68A',
          },
          duplicate: {
            bg: '#EEF2FF',
            text: '#3730A3',
            border: '#C7D2FE',
          },
        },

        // Borders
        border: {
          subtle: '#E5E7EB',
          strong: '#D1D5DB',
          active: '#E8384F',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        drawer: '-4px 0 24px rgba(0, 0, 0, 0.08)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
