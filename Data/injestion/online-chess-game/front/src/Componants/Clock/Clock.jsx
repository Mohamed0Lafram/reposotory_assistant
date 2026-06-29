import { useEffect, useRef, useState } from "react";

export default function Clock({ color, time, isActive }) {
  const reverse_counter = useRef(time * 60); // initialize once
  const [seconds, setSeconds] = useState(time * 60);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // start counting down
      intervalRef.current = setInterval(() => {
        reverse_counter.current -= 1;
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            
            return 0;
          }
          console.log('test')
          return prev - 1;
        });
      }, 1000);
    } else {
      // pause
      clearInterval(intervalRef.current);
    }

    // cleanup when unmounting or isActive changes
    return () => clearInterval(intervalRef.current);
  }, [isActive]);



  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;
  const formattedSecond = String(second).padStart(2, '0');

  return (
    <div
      className="Clock"
      style={{
        width: '120px',
        minHeight: '56px',
        borderRadius: '18px',
        padding: '10px 12px',
        background: color === 'white'
          ? 'linear-gradient(180deg, #ffffff, #f8fafc)'
          : 'linear-gradient(180deg, #0f172a, #1e293b)',
        boxShadow: color === 'white'
          ? '0 20px 60px rgba(148, 163, 184, 0.18)'
          : '0 20px 60px rgba(15, 23, 42, 0.45)',
        border: color === 'white' ? '1px solid rgba(229, 231, 235, 0.7)' : '1px solid rgba(148, 163, 184, 0.18)',
        color: color === 'white' ? '#0f172a' : '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>
        {color === 'white' ? 'White' : 'Black'}
      </span>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em' }}>
        {minute}:{formattedSecond}
      </span>
    </div>
  );
}
