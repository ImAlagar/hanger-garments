  /** @type {import('tailwindcss').Config} */
  export default {
    darkMode: "class",
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        
        colors: {
          "primary": "#ECE7F9",
        },
        fontFamily: {
          'instrument': ['"Instrument Sans"', 'sans-serif'],
          'italiana': ['"Italiana"', 'sans-serif'],
          'bai-jamjuree': ['"Bai Jamjuree"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
