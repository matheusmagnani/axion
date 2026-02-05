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
        'app-bg': 'var(--color-app-bg)',
        'app-primary': 'var(--color-app-primary)',
        'app-secondary': 'var(--color-app-secondary)',
        'app-accent': 'var(--color-app-accent)',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      transitionDuration: {
        '800': '800ms',
      },
    },
  },
  plugins: [heroui()],
}
