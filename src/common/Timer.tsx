'use client'

import React, { useEffect, useState } from 'react';

interface TimerProps {
  endTime: string;
}

const Timer: React.FC<TimerProps> = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endTime).getTime() - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        ชั่วโมง: Math.floor((difference / (1000 * 60 * 60)) % 24),
        นาที: Math.floor((difference / 1000 / 60) % 60),
        วินาที: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = {
        ชั่วโมง: 0,
        นาที: 0,
        วินาที: 0,
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<any>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">

      เหลือเวลา {timeLeft.ชั่วโมง} ชม {timeLeft.นาที} นาที {timeLeft.วินาที} วิ
    </div>
  );
};

export default Timer;
