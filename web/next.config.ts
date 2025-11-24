import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
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
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);