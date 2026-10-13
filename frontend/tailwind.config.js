/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Color Palette
        parchment: {
          DEFAULT: '#FAF6EF', // Main Page Body Background
          50: '#FFFFFF',
          100: '#FAF6EF',
          200: '#E6DCCD', // Card Border
          300: '#D9CDBB',
        },
        ink: {
          DEFAULT: '#2B2622', // Main Text & Headings
          heading: '#2B2622',
          body: '#2B2622',
          muted: '#6B6258', // Card details & secondary text
          details: '#6B6258',
        },
        terracotta: {
          DEFAULT: '#E07A3F', // Primary Accent Button
          50: '#FDF6F0',
          100: '#FBEADE',
          500: '#E07A3F',
          600: '#C8642D',
        },
        pine: {
          DEFAULT: '#2F5D50', // Hero / banner background
          dark: '#243B34',    // Footer background
          50: '#F2F7F5',
          100: '#D9E4DE',
          500: '#2F5D50',
          600: '#243B34',
        },
        amber: {
          DEFAULT: '#F2B134', // Hero button & Footer accent
          50: '#FEFBF3',
          100: '#FBEBC8',
          300: '#F2B134',
          600: '#8A5A00',
        },
        gold: {
          DEFAULT: '#B08D57',
          50: '#F3E8CB',
          500: '#B08D57',
          600: '#967745',
        },

        // Status Colors (Soft Tinted Badges)
        status: {
          available: {
            bg: '#DDEFE5',
            text: '#1F6B4A',
            border: '#BFE0CE',
          },
          booked: {
            bg: '#F6DFDA',
            text: '#9A3B2E',
            border: '#ECC2BA',
          },
          pending: {
            bg: '#FBEBC8',
            text: '#8A5A00',
            border: '#F6D792',
          }
        },

        // Backwards compatibility mappings for existing utility tokens
        ledger: {
          950: '#243B34',
          900: '#2F5D50',
          800: '#2B2622',
          700: '#2B2622',
          600: '#6B6258',
          500: '#6B6258',
          400: '#B08D57',
          300: '#E6DCCD',
          200: '#E6DCCD',
          100: '#FAF6EF',
        },
        brass: {
          50: '#FBEBC8',
          100: '#FBEBC8',
          300: '#F2B134',
          400: '#E07A3F',
          500: '#E07A3F',
          600: '#C8642D',
          700: '#8A5A00',
        },
        sage: {
          50: '#DDEFE5',
          100: '#DDEFE5',
          200: '#BFE0CE',
          500: '#2F5D50',
          700: '#1F6B4A',
        },
        danger: {
          DEFAULT: '#9A3B2E',
          light: '#F6DFDA',
          dark: '#7A2C21',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        heading: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        'heading': '0px',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
