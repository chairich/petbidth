'use client';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DeleteBidButton({ bidId, onDeleted }: { bidId: string, onDeleted?: () => void }) {
  const supabase = createClientComponentClient();

  const handleDelete = async () => {
    const confirm = window.confirm("ยืนยันการลบราคาประมูลนี้ใช่หรือไม่?");
    if (!confirm) return;

    const { error } = await supabase.from("bids").delete().eq("id", bidId);
    if (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } else {
      alert("ลบเรียบร้อยแล้ว");
      onDeleted?.();
    }
  };

  return (
    <Button
      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
      onClick={handleDelete}
    >
      ลบราคานี้
    </Button>
  );
}
