/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0c0c0f',
        bg2: '#111114',
        surface: '#151519',
        surface2: '#1c1c22',
        surface3: '#26262e',
        border: '#2a2a35',
        'border-subtle': '#1f1f28',
        ember: '#ff6b35',
        'ember-dim': '#cc5229',
        'ember-glow': '#ff8c5a',
        ice: '#6c9fff',
        'ice-dim': '#4a7fdd',
        mint: '#34d399',
        'mint-dim': '#059669',
        flame: '#ef4444',
        gold: '#f59e0b',
        violet: '#8b5cf6',
        text: '#ececf1',
        text2: '#a1a1aa',
        muted: '#63636e',
        // Legacy aliases for compatibility
        cyan: '#ff6b35',
        'cyan-dim': '#cc5229',
        magenta: '#8b5cf6',
        'magenta-dim': '#6d28d9',
        ngreen: '#34d399',
        'ngreen-dim': '#059669',
        nred: '#ef4444',
        nyellow: '#f59e0b',
        npurple: '#8b5cf6',
      },
      fontFamily: {
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        cardEntry: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ringPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6', borderColor: 'rgba(255,107,53,0.4)' },
          '100%': { transform: 'scale(1.4)', opacity: '0', borderColor: 'rgba(255,107,53,0)' },
        },
        borderGlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        fadeIn: 'fadeIn 0.4s ease both',
        popIn: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        cardEntry: 'cardEntry 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'cardEntry-delay': 'cardEntry 0.5s cubic-bezier(0.22,1,0.36,1) 0.12s both',
        scaleIn: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        blink: 'blink 2s infinite',
        pulse: 'pulse 1s infinite',
        shake: 'shake 0.3s ease',
        spin: 'spin 0.8s linear infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        ringPulse: 'ringPulse 2s ease-out infinite',
        borderGlow: 'borderGlow 3s ease infinite',
      },
    },
  },
  plugins: [],
}

