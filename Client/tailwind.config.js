/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New EduNex color palette
        primary: '#0B1E2A',      // Deep Navy Blue (Background)
        secondary: '#F2F2F2',    // Off-white / Pale Cream (Text default)
        accent: '#FFB627',       // Warm Yellow/Orange (Bulb Fill/Glow)
        dark: '#1E1E1E',         // Original dark color (keeping for compatibility)
        'rich-blue': '#245C8D',  // Rich Blue (Book Symbol)
        'bright-green': '#37B46E', // Bright Green (Circuit Lines/AI and Text "X")
        'light-yellow': '#FFF3D6' // White / Light Yellow (Bulb Tip/Pen Nib)
      },
      textColor: {
        'bright-green': '#37B46E', // Explicitly defining text-bright-green
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}