/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['"Fira Code"', 'monospace'],
        },
        colors: {
          'editor-dark': '#1e1e1e',
          'editor-light': '#ffffff',
        },
        boxShadow: {
          'code': '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    plugins: [],
  };