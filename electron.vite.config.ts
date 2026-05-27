import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    publicDir: resolve('src/renderer/src/public'),
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
      'process.env.GROQ_API_KEY': JSON.stringify(process.env.GROQ_API_KEY || ''),
      'process.env.TAVILY_API_KEY': JSON.stringify(process.env.TAVILY_API_KEY || ''),
      'process.env.LOCAL_PIN': JSON.stringify(process.env.LOCAL_PIN || '1705')
    }
  }
})