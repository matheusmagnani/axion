import { heroui } from '@heroui/theme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'app-bg': 'rgb(var(--color-app-bg-rgb) / <alpha-value>)',
        'app-primary': 'rgb(var(--color-app-primary-rgb) / <alpha-value>)',
        'app-secondary': 'rgb(var(--color-app-secondary-rgb) / <alpha-value>)',
        'app-accent': 'rgb(var(--color-app-accent-rgb) / <alpha-value>)',
        'app-gray': 'rgb(var(--color-app-gray-rgb) / <alpha-value>)',
        'app-white': 'rgb(var(--color-app-white-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },
      fontWeight: {
        'normal': 'var(--font-weight-normal)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
      },
      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
      },
      transitionDuration: {
        '800': '800ms',
      },
    },
  },
  plugins: [heroui()],
}
