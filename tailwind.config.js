/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/*.liquid',
    './templates/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme color system - easily customizable
        'primary': 'var(--color-primary, #FF6B9D)',
        'primary-light': 'var(--color-primary-light, #FF9BBD)',
        'primary-dark': 'var(--color-primary-dark, #E54B7D)',
        'secondary': 'var(--color-secondary, #3B82F6)',
        'secondary-light': 'var(--color-secondary-light, #60A5FA)',
        'secondary-dark': 'var(--color-secondary-dark, #2563EB)',
        'accent': 'var(--color-accent, #F97316)',
        'accent-light': 'var(--color-accent-light, #FB923C)',
        'accent-dark': 'var(--color-accent-dark, #EA580C)',
        'success': 'var(--color-success, #10B981)',
        'warning': 'var(--color-warning, #F59E0B)',
        'danger': 'var(--color-danger, #EF4444)',
        'info': 'var(--color-info, #3B82F6)',
        'surface': 'var(--color-surface, #FFFFFF)',
        'surface-dark': 'var(--color-surface-dark, #1F2937)',
        'text': 'var(--color-text, #111827)',
        'text-light': 'var(--color-text-light, #6B7280)',
        'text-dark': 'var(--color-text-dark, #F9FAFB)',
        'border': 'var(--color-border, #E5E7EB)',
        'border-dark': 'var(--color-border-dark, #374151)',
        
        // Legacy colors for backward compatibility
        'glamics-pink': '#FF6B9D',
        'glamics-purple': '#8B5CF6',
        'glamics-indigo': '#6366F1',
        'glamics-blue': '#3B82F6',
        'glamics-teal': '#14B8A6',
        'glamics-orange': '#F97316',
        'glamics-yellow': '#F59E0B',
      },
      fontFamily: {
        sans: ['var(--font-family-sans, "Helvetica Neue", "Helvetica", "Arial", "sans-serif")'],
        serif: ['var(--font-family-serif, "Georgia", "Cambria", "Times New Roman", "Times", "serif")'],
        heading: ['var(--font-family-heading, "Poppins", "Helvetica Neue", "Helvetica", "Arial", "sans-serif")'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out forwards',
        'slide-up': 'slideUp 0.8s ease-in-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-in-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-in-out forwards',
        'zoom-in': 'zoomIn 0.8s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        zoomIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'hover': '0 8px 17px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      aspectRatio: {
        'square': '1 / 1',
        'video': '16 / 9',
        'portrait': '4 / 5',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}
