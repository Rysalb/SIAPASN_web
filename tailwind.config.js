/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        card: {
          DEFAULT: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
        },
        input: 'var(--bg-input)',
        modal: 'var(--bg-modal)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
          foreground: 'var(--secondary-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        body: 'var(--text-primary)',
        subtitle: 'var(--text-secondary)',
        submuted: 'var(--text-muted)',
        success: {
          DEFAULT: 'var(--success)',
          light: 'var(--success-light)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          light: 'var(--warning-light)',
          foreground: 'var(--warning-foreground)',
        },
        error: {
          DEFAULT: 'var(--error)',
          light: 'var(--error-light)',
          foreground: 'var(--error-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          light: 'var(--info-light)',
          foreground: 'var(--info-foreground)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.875rem',
      },
    },
  },
  plugins: [],
};
