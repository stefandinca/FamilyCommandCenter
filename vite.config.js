import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base path for subdirectory deployment
  // Change this to '/' if deploying to domain root
  base: '/familysync/',
})
