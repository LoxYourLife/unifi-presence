import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

module.exports = defineConfig({
  base: '/plugins/unifi_presence',
  root: 'app',
  write: false,
  plugins: [vue(), quasar({ sassVariables: 'app/quasar.extras.sass', autoImportComponentCase: 'combined' })],
  build: {
    outDir: path.resolve(__dirname, 'build'),
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'app/build.html')
      },
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'vue'
        }
      }
    }
  },
  server: {
    port: 9000,
    proxy: {
      '/plugins/unifi_presence/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true
      }
    }
  }
});
