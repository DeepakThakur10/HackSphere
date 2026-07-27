/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5F7FB',
        surface: '#FFFFFF',
        surfaceMuted: '#EEF2F7',
        border: '#D7DEE9',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        brand: {
          50: '#EEF8FF',
          100: '#D9EEFF',
          200: '#B9DFFF',
          300: '#86C8FF',
          400: '#4FAEFF',
          500: '#2C8FFF',
          600: '#1D6EEB',
          700: '#1B56C2',
          800: '#1D479C',
          900: '#1C3E7C',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.08)',
        card: '0 20px 45px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(rgba(255,255,255,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.65) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
