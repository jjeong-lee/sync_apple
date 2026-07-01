/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1115',
        mist: '#f5f5f7',
        steel: '#6e6e73',
        line: '#d2d2d7',
        accent: '#0071e3',
        accentSoft: '#58a6ff',
        panel: '#fbfbfd',
      },
      boxShadow: {
        floating: '0 30px 80px rgba(15, 17, 21, 0.12)',
      },
      backgroundImage: {
        glow: 'radial-gradient(circle at top right, rgba(88,166,255,0.25), transparent 42%)',
      },
    },
  },
  plugins: [],
};
