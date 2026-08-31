/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // ou vos domaines autorisés
      },
      // Ajoutez vos domaines spécifiques
    ],
  },
};

module.exports = nextConfig;
