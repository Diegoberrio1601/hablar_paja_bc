import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'blob.lacaderadeeva.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'imgmedia.larepublica.pe',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'bibliotecamiguelcatalan.wordpress.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cadenaser.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'revistametro.co',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
