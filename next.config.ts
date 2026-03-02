import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'medical-tracker-user-avatar-bucket.s3.us-east-1.amazonaws.com',
      pathname: '/**', // allow all paths
    },
  ],
}
};

export default nextConfig;
