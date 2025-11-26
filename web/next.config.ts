import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {

  // Output standalone para producción
  output: 'standalone',

  // React strict mode
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.cantech.pro",
      },
      {
        protocol: "https",
        hostname: "cantech.pro",
      },
    ],
  },
  
  
  experimental: {
    serverActions: {
      allowedOrigins: ["https://www.cantech.pro", "https://cantech.pro"],
    },
  },

  async headers() {
      return [
          {
              // matching all API routes
              source: "/api/:path*",
              headers: [
                  { key: "Access-Control-Allow-Credentials", value: "true" },
                  { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                  { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                  { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
              ]
          }
      ]
  }

};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);