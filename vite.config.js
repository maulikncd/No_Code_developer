import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/', // ✅ ROOT DEPLOY (S3 / EC2 / CloudFront)
  plugins: [react(), tailwindcss()],
})
