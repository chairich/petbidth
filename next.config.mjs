/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['lhrszqycskubmmtisyou.supabase.co'], // ← เปลี่ยนให้ตรงกับโดเมนของโปรเจกต์คุณ
  },
};

export default nextConfig;
