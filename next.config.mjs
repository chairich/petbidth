/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'lhrszqycskubmmtisyou.supabase.co', // ของ Supabase เดิม
      'placehold.co',                     // ← ✅ เพิ่มอันนี้เข้าไป
    ],
  },
};

export default nextConfig;
