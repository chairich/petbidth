'use client';

import { useEffect, useState } from 'react';

type MyTimerProps = {
  endTime: string;
};

const MyTimer = ({ endTime }: MyTimerProps) => {
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
      <div><span className="days">{timeLeft.days}</span><span>วัน</span></div>
      <div><span className="hours">{timeLeft.hours}</span><span>ชม.</span></div>
      <div><span className="minutes">{timeLeft.minutes}</span><span>นาที</span></div>
      <div><span className="seconds">{timeLeft.seconds}</span><span>วิ</span></div>
    </div>
  );
};

export default MyTimer;
