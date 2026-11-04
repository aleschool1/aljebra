/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        sky: {
          950: '#0a1838',
        },
        parchment: '#f5ecd3',
        gold: {
          400: '#f5c451',
          500: '#e9a728',
          600: '#c9851a',
        },
      },
      keyframes: {
        floatY: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        popIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        badgePop: {
          '0%': { transform: 'scale(0) rotate(-20deg)' },
          '70%': { transform: 'scale(1.15) rotate(6deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        cloudDrift: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(40px)' },
        },
      },
      animation: {
        floatY: 'floatY 3s ease-in-out infinite',
        floatSlow: 'floatSlow 5s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        pulseRing: 'pulseRing 2.2s ease-out infinite',
        popIn: 'popIn 0.35s ease-out both',
        slideUp: 'slideUp 0.4s ease-out both',
        shimmer: 'shimmer 3s linear infinite',
        badgePop: 'badgePop 0.5s ease-out both',
        cloudDrift: 'cloudDrift 12s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
