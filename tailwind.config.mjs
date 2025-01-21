/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F3457',  // Deep blue
        accent: '#CFBC7A',   // Yellow
      },
    },
  },
  plugins: [],
}