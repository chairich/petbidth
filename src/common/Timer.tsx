'use client'
import { useEffect, useState } from 'react';

type TimerProps = {
  endTime: string | Date;
};

const MyTimer = ({ endTime }: TimerProps) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft: any = {};

    if (difference > 0) {
      timeLeft = {
        ชั่วโมง: Math.floor((difference / (1000 * 60 * 60)) % 24),
        นาที: Math.floor((difference / 1000 / 60) % 60),
        วินาที: Math.floor((difference / 1000) % 60)
      };
    } else {
      timeLeft = { หมดเวลา: true };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="countdown-timer text-white small">
      {timeLeft.หมดเวลา ? (
        <span>หมดเวลา</span>
      ) : (
        <span>
          {timeLeft.ชั่วโมง} ชม {timeLeft.นาที} นาที {timeLeft.วินาที} วิ
        </span>
      )}
    </div>
  );
};

export default MyTimer;
