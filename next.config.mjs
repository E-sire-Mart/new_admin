// /** @type {import('next').NextConfig} */
// const config = {
//   // distDir: 'build', // This will change the output directory to 'build'
//   // output: 'export',
//   images: {
//     unoptimized: true, // Disable image optimization for static export
//   },
// };

// export default config;


/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE output: 'export' to use next start
  reactStrictMode: true,
  // ... any other config
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig