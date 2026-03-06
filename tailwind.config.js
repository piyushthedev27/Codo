/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'bg-main': '#0a0a0f',
                'bg-secondary': '#12121a',
                'bg-card': '#1a1a2e',
                'bg-card-hover': '#22223a',
                border: '#2a2a3e',
                'purple-primary': '#6c63ff',
                'cyan-secondary': '#00d4ff',
                'green-success': '#00ff88',
                'gold-warning': '#ffd700',
                'red-danger': '#ff4d6d',
                'text-primary': '#e8e8f0',
                'text-secondary': '#8888aa',
            },
            fontFamily: {
                pixel: ['"Press Start 2P"', 'cursive'],
                retro: ['VT323', 'monospace'],
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                sm: '2px',
                md: '4px',
                lg: '8px',
                xl: '12px',
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                marquee: 'marquee 20s linear infinite',
                shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 12px rgba(108, 99, 255, 0.33)' },
                    '50%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.66)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                shake: {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
                },
            },
        },
    },
    plugins: [],
};
