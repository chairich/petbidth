
'use client';
import { useRef, useState } from 'react';
import './wheel.css';

const prizes = ['10 แต้ม', '20 แต้ม', 'เสียใจ 😭', '50 แต้ม', '100 แต้ม', 'VIP 1 วัน'];

export default function CasinoWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const segment = 360 / prizes.length;
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const extraSpins = 5;
    const finalDeg = 360 * extraSpins + (randomIndex * segment) + segment / 2;

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s ease-out';
      wheelRef.current.style.transform = `rotate(${finalDeg}deg)`;
    }

    setTimeout(() => {
      setResult(prizes[randomIndex]);
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center text-white">
      <div className="relative w-64 h-64">
        <div ref={wheelRef} className="wheel absolute inset-0 rounded-full border-4 border-yellow-500">
          {prizes.map((prize, i) => (
            <div
              key={i}
              className="segment absolute w-1/2 h-1/2 origin-bottom-left"
              style={{
                transform: `rotate(${(360 / prizes.length) * i}deg)`,
              }}
            >
              <div
                className="text-sm text-center"
                style={{
                  transform: `rotate(${360 / prizes.length / 2}deg) translateY(-90%)`,
                }}
              >
                {prize}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500" />
        </div>
      </div>
      <button
        className="mt-6 px-4 py-2 bg-yellow-400 text-black rounded shadow hover:bg-yellow-500 disabled:opacity-50"
        onClick={spinWheel}
        disabled={spinning}
      >
        {spinning ? 'กำลังหมุน...' : 'หมุนเลย!'}
      </button>
      {result && <p className="mt-4 text-xl">🎁 คุณได้รับ: <strong>{result}</strong></p>}
    </div>
  );
}
