'use client'

import React, { useEffect, useState } from 'react';

type TimerProps = {
  endTime: string;
};

const MyTimer: React.FC<TimerProps> = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
    };

    if (difference > 0) {
      timeLeft = {
        days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
        minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0'),
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
      <div><span>{timeLeft.days}</span> วัน</div>
      <div><span>{timeLeft.hours}</span> ชม.</div>
      <div><span>{timeLeft.minutes}</span> นาที</div>
      <div><span>{timeLeft.seconds}</span> วิ</div>
    </div>
  );
};

export default MyTimer;
