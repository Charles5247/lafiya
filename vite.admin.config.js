import { defineConfig } from 'vite';

if (process.env.VERCEL && (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY)) {
  throw new Error('Admin deployment requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    rollupOptions: {
      input: 'admin.html',
    },
  },
});
