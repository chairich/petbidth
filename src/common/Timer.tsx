
'use client';

import { useEffect, useState } from 'react';

type TimerProps = {
  endTime: string | Date;
};

const Timer = ({ endTime }: TimerProps) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
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
    <div className="timer">
      <small>เหลือเวลา</small>
      <strong>{timeLeft.minutes} นาที {timeLeft.seconds} วินาที</strong>
    </div>
  );
};

export default Timer;
