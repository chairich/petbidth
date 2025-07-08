'use client'
import React, { useEffect, useState } from 'react';

type MyTimerProps = {
  endTime: string | Date;
};

const MyTimer: React.FC<MyTimerProps> = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
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
    <div className="timer">
      <span>{timeLeft.minutes} นาที {timeLeft.seconds} วินาที</span>
    </div>
  );
};

export default MyTimer;
