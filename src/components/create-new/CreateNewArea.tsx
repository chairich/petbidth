const handleSubmit = async () => {
  // ตรวจสอบว่าแอดมินหรือผู้ใช้ที่มีสิทธิ์โพสต์
  if (userRole !== 'admin' && userRole !== 'vip') {
    alert('คุณไม่มีสิทธิ์ในการโพสต์ประมูล');
    return;
  }

  const { data: session } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    alert('กรุณาเข้าสู่ระบบ');
    return;
  }

  // คำนวณเวลาปิดการประมูล (เพิ่ม 3 วันจากเวลาปัจจุบัน)
  const currentDate = new Date();
  const endTime = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(); // เพิ่ม 3 วัน

  // อัปโหลดรูปภาพและบันทึก URL ลงในฐานข้อมูล
  const imageUrls: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const { data, error } = await supabase.storage
      .from('auction-images')
      .upload(`auction/${uuidv4()}`, image);

    if (error) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      return;
    }
    imageUrls.push(`${SUPABASE_URL}/storage/v1/object/public/auction-images/${data.path}`);
  }

  // ตรวจสอบให้ `cover_image_index` อยู่ในขอบเขตที่ถูกต้อง
  const validCoverImageIndex = coverImageIndex >= 0 && coverImageIndex < images.length ? coverImageIndex : 0;

  // ไม่ต้องกำหนด `id` เพราะฐานข้อมูลจะสร้าง UUID ให้เอง
  const { error } = await supabase.from('auctions').insert([{
    title,
    description,
    start_price: startPrice,
    end_time: endTime, // ใช้เวลา `endTime` ที่คำนวณได้
    created_by: userId,
    images: imageUrls,
    cover_image_index: validCoverImageIndex, // ใช้ index ที่ถูกต้อง
    is_closed: false,
    created_at: new Date().toISOString(),
  }]);

  if (error) {
    alert('เกิดข้อผิดพลาดในการโพสต์ประมูล');
    return;
  }

  alert('โพสต์ประมูลสำเร็จ!');
  router.push('/auction'); // เปลี่ยนเส้นทางไปยังหน้าประมูลทั้งหมด
};
