const newAuction = {
  title: formData.title,
  description: formData.description,
  start_price: parseFloat(formData.start_price),
  end_time: formData.end_time,
  cover_image_index: coverImageIndex,     // ✅ ตัวเลข
  images: imageUrls,                      // ✅ array string
  created_by: userData.user.id,           // ✅ ID จริงจาก user
  is_closed: false,
  created_at: new Date().toISOString(),
};
