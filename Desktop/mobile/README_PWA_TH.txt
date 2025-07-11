คู่มือการติดตั้ง PWA (ติดตั้งแอป PetBidThai บนมือถือ)

1. คัดลอกไฟล์จากโฟลเดอร์ `public/` ลงในโปรเจกต์ Next.js ของคุณ:
   - manifest.json
   - logo192x192.png
   - logo512x512.png
   - service-worker.js

2. เพิ่มใน `<head>` ของ `app/layout.tsx`:
   <link rel="manifest" href="/manifest.json" />
   <link rel="apple-touch-icon" href="/logo192x192.png" />
   <meta name="theme-color" content="#000000" />

3. นำ `ServiceWorkerRegister.tsx` ไปไว้ใน `app/_components/`

4. ใส่ component นี้ใน layout.tsx:
   <ServiceWorkerRegister />

5. เมื่อเปิดเว็บผ่านมือถือ Chrome / Safari จะสามารถกด "ติดตั้งแอป" ได้อัตโนมัติ

✅ เสร็จสมบูรณ์