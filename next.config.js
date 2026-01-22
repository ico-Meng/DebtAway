/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['www.lssmn.org'],
    },
    // Increase chunk size limits to handle large pages
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    ...config.optimization.splitChunks,
                    maxSize: 244000, // 244KB
                },
            };
        }
        return config;
    },
    // Disable static optimization for large pages
    experimental: {
        optimizePackageImports: ['react', 'react-dom'],
    },
}

module.exports = nextConfig
