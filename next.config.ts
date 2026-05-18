import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'victoria-visualcontent.vercel.app',
          },
        ],
        destination: 'https://victoria-mc.vercel.app/free-lection/vsl-form',
        permanent: true,
      },
    ];
  },
};

export default config;
