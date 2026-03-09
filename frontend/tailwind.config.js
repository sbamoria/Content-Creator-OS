module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#18181B',
          foreground: '#FAFAFA',
        },
        secondary: {
          DEFAULT: '#F4F4F5',
          foreground: '#18181B',
        },
        accent: {
          DEFAULT: '#EA580C',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FFFFFF',
          subtle: '#FAFAFA',
          dashboard: '#F9FAFB',
        },
        surface: {
          card: '#FFFFFF',
          border: '#E4E4E7',
          input: '#F4F4F5',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Public Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
