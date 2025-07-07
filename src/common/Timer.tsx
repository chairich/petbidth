'use client';

import React, { useEffect, useState } from 'react';

interface TimerProps {
  endTime: string;
}

const MyTimer: React.FC<TimerProps> = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
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
    <div className="bid-ends">
      <div><span>{timeLeft.days}</span><span>Days</span></div>
      <div><span>{timeLeft.hours}</span><span>Hours</span></div>
      <div><span>{timeLeft.minutes}</span><span>Min</span></div>
      <div><span>{timeLeft.seconds}</span><span>Sec</span></div>
    </div>
  );
};

export default MyTimer;
