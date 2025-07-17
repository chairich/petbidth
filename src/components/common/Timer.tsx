'use client'
import React, { useEffect, useState } from 'react';

const Timer = ({ endTime }: { endTime: string }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft: any = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
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
    <div className="countdown-timer bg-warning text-dark px-2 py-1 position-absolute bottom-0 start-0 m-2" style={{ fontSize: '0.85rem' }}>
      ⏳ {timeLeft.days}วัน {timeLeft.hours}ชั่วโมง {timeLeft.minutes}นาที {timeLeft.seconds}วินาที
    </div>
  );
};

export default Timer;