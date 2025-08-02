import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  build: {
    // Build optimizations
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils-vendor': ['moment', 'dayjs', 'date-fns', 'xlsx', 'recharts'],
          'emoji-vendor': ['@emoji-mart/data', '@emoji-mart/react', 'emoji-mart'],
          'animation-vendor': ['aos']
        },
        // Asset optimization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    // Terser configuration
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    // Enable CORS for development
    cors: true,
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Preview server configuration
  preview: {
    port: 4173,
    host: true
  },
  // CSS optimization
  css: {
    postcss: {
      plugins: [
        // PostCSS plugins can be added here if needed
        // For now, we'll use the default PostCSS configuration
      ]
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@supabase/supabase-js',
      'moment',
      'dayjs',
      'date-fns'
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on demand
      '@emoji-mart/data',
      '@emoji-mart/react',
      'emoji-mart'
    ]
  },
  // Define environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production')
  },
  // Performance optimizations
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Optimize JSX
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
})
