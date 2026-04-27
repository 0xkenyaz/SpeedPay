/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eefffd',
          100: '#c5fff9',
          200: '#8bfff4',
          300: '#4af8ec',
          400: '#16e3da',
          500: '#00c7bf',
          600: '#009f9a',
          700: '#027e7b',
          800: '#086362',
          900: '#0c5251',
          950: '#002f30',
        },
        arc: {
          bg: '#080c10',
          card: '#0d1117',
          border: '#1c2738',
          muted: '#8b949e',
          accent: '#00e5d1',
          gold: '#f0a500',
          danger: '#f85149',
          success: '#3fb950',
        }
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(180,100%,45%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.05) 0px, transparent 50%)',
        'card-glow': 'linear-gradient(135deg, rgba(0,229,209,0.05) 0%, transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0,229,209,0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(0,229,209,0.5)' },
        },
      },
    },
  },
  plugins: [],
}
