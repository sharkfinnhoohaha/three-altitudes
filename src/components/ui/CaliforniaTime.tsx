'use client';

import { useState, useEffect } from 'react';

function getCaliforniaTime() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

interface CaliforniaTimeProps {
  style?: React.CSSProperties;
  className?: string;
}

export function CaliforniaTime({ style, className }: CaliforniaTimeProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(getCaliforniaTime());
    const id = setInterval(() => setTime(getCaliforniaTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={style} className={className}>
      {time}
    </span>
  );
}
