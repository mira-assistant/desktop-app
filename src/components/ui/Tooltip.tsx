'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: 60,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          className={cn(
            'fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg',
            'shadow-lg -translate-x-1/2 transition-opacity duration-200',
            'opacity-0 animate-fadeIn'
          )}
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {content}
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-in forwards;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}