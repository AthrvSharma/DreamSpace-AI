import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    const devApiTarget = process.env.VITE_DEV_API_TARGET;
    const proxy = devApiTarget
        ? ['/api', '/uploads', '/generated', '/exports'].reduce((acc, prefix) => {
            acc[prefix] = {
                target: devApiTarget,
                changeOrigin: true,
            };
            return acc;
        }, {})
        : undefined;

    return {
        plugins: [react()],
        server: {
            port: Number(process.env.VITE_DEV_PORT) || 5173,
            proxy,
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: './src/setupTests.js',
        },
    };
});
