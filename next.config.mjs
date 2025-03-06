/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['canvas'],
  images: {
    domains: ['localhost'],
  },
  typescript: {
    // !! ADVERTENCIA !!
    // Esta opción ignora los errores de tipo durante la compilación
    // Solo debería usarse temporalmente para resolver problemas de despliegue
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
