import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;

    function step(timestamp: number) {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}
