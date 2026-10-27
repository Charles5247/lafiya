import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  ssgOptions: {
    entry: 'src/main.jsx',
    dirStyle: 'nested',
  },
});

