/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true, // << เพิ่มบรรทัดนี้
    remotePatterns: [
      { protocol: 'https', hostname: 'lhrszqycskubmmtisyou.supabase.co' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
};

export default nextConfig;
