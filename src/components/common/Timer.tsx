'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

const Timer = ({ endTime }: { endTime: string }) => {
  const calculateTimeLeft = () => {
    const now = dayjs().tz('Asia/Bangkok');
    const end = dayjs.utc(endTime).tz('Asia/Bangkok');
    const diff = end.diff(now);

    return diff > 0 ? dayjs.duration(diff) : dayjs.duration(0);
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="countdown-box bg-warning text-dark position-absolute bottom-0 start-0 m-2 px-3 py-1 rounded small">
      ⏳ {timeLeft.days()}วัน {timeLeft.hours()}ชั่วโมง {timeLeft.minutes()}นาที {timeLeft.seconds()}วินาที
    </div>
  );
};

export default Timer;
