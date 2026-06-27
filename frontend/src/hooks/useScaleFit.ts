import { useState, useEffect, useRef } from 'react';

interface UseScaleFitOptions {
  targetWidth: number;
  minScale?: number;
  maxScale?: number;
}

export function useScaleFit({
  targetWidth,
  minScale = 0.4,
  maxScale = 1,
}: UseScaleFitOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(targetWidth);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const width = container.offsetWidth;
      setContainerWidth(width);
      const newScale = Math.min(Math.max(width / targetWidth, minScale), maxScale);
      setScale(newScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, [targetWidth, minScale, maxScale]);

  return { containerRef, scale, containerWidth };
}
