/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        page: '#09090b',
        surface: '#18181b',
        ink: '#fafafa',
        muted: '#a1a1aa',
        line: '#3f3f46',
        accent: '#e11d48',
      },
    },
  },
  plugins: [],
};
