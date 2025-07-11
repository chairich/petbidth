# Admin Creator Script

## Setup

1. สร้างโปรเจกต์ใหม่ แล้วแตก ZIP นี้
2. แก้ไข `.env.local` ให้เป็น URL และ SERVICE ROLE KEY จาก Supabase ของคุณ
3. ติดตั้ง dependencies:
   ```bash
   npm install
   ```
4. รันสคริปต์:
   ```bash
   npm run create-admins
   ```
5. หากมีผู้ใช้ซ้ำอยู่แล้วในระบบ Supabase Auth จะขึ้น error แจ้ง

> หมายเหตุ: ระบบนี้ไม่ใช้ Trigger ในการเพิ่มลง public.users