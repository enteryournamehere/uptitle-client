import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/

export default {

  server: {
    port: 8081
  },

  plugins: [svelte()]
}
