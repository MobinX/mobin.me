import { withContentlayer } from 'next-contentlayer'

export default withContentlayer({
    images: {
        domains: ['images.unsplash.com', 'cdn.buymeacoffee.com', 'github.com'],
    },
    reactStrictMode: true,
    swcMinify: true,
    async redirects() {
        return [
            {
                source: '/articles/deep-dive-in-attension-mechanism',
                destination: '/articles/deep-dive-in-attention-mechanism',
                permanent: true,
            },
        ]
    },
    experimental: {
        scrollRestoration: true,
        mdxRs: false,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
})