/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border-hsl) / <alpha-value>)',
        input: 'hsl(var(--input-hsl) / <alpha-value>)',
        ring: 'hsl(var(--ring-hsl) / <alpha-value>)',
        background: 'hsl(var(--background-hsl) / <alpha-value>)',
        foreground: 'hsl(var(--foreground-hsl) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground-hsl) / <alpha-value>)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground-hsl) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground-hsl) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground-hsl) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground-hsl) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground-hsl) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground-hsl) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background-hsl) / <alpha-value>)',
          foreground: 'hsl(var(--sidebar-foreground-hsl) / <alpha-value>)',
          primary: 'hsl(var(--sidebar-primary-hsl) / <alpha-value>)',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground-hsl) / <alpha-value>)',
          accent: 'hsl(var(--sidebar-accent-hsl) / <alpha-value>)',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground-hsl) / <alpha-value>)',
          border: 'hsl(var(--sidebar-border-hsl) / <alpha-value>)',
          ring: 'hsl(var(--sidebar-ring-hsl) / <alpha-value>)',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // DealFlow status tokens
        deal: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          surfaceHover: 'var(--surface2)',
          border: 'var(--border)',
          accent: 'var(--accent)',
          success: 'var(--green)',
          warning: 'var(--amber)',
          danger: 'var(--red)',
          info: 'var(--cyan)',
          purple: 'var(--purple)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    (() => {
      try {
        return require('tailwindcss-animate');
      } catch (e) {
        return function() {};
      }
    })(),
  ],
}
