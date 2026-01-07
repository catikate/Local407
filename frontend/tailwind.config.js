/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F7F7F5',
        'card-bg': '#FFFFFF',
        'hover': '#F1F1EF',

        // Text colors
        'text-primary': '#37352F',
        'text-secondary': '#787774',
        'text-muted': '#9B9A97',

        // Accent color (blue)
        'accent': '#2383E2',
        'accent-hover': '#1E6FBF',

        // Border
        'border': '#E9E9E7',

        // Status colors
        'success': '#0F7B6C',
        'warning': '#D9730D',
        'error': '#EB5757',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'notion-md': '0 2px 6px rgba(0, 0, 0, 0.06)',
        'notion-lg': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'DEFAULT': '0.375rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}