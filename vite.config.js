import { defineConfig } from 'vite';

export default defineConfig({
  // relative asset paths: the site is served from /avnt/ on GitHub Pages
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        product: 'product.html',
        cart: 'cart.html',
        info: 'info.html',
      },
    },
  },
});
