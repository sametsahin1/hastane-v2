import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-beautiful-dnd']
  },
  resolve: {
    alias: {
      'react-beautiful-dnd': 'react-beautiful-dnd/dist/react-beautiful-dnd.esm.js'
    }
  }
})
