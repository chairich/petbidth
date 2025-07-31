// WheelGame.tsx
import { useState } from 'react';

const prizes = ['10 แต้ม', '20 แต้ม', 'เสียใจ 😭', '50 แต้ม', '100 แต้ม'];

export default function WheelGame() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      setResult(prize);
      setSpinning(false);
    }, 1500);
  };

  return (
    <div className="p-6 text-center text-white bg-gray-800 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">🎁 วงล้อเสี่ยงโชค</h2>
      <button
        className="bg-yellow-500 px-4 py-2 rounded shadow hover:bg-yellow-600"
        onClick={spin}
        disabled={spinning}
      >
        {spinning ? 'กำลังหมุน...' : 'หมุนเลย!'}
      </button>
      {result && <p className="mt-4 text-xl">ผลลัพธ์: <strong>{result}</strong></p>}
    </div>
  );
}
