import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RotatingTextProps {
  messages: string[];
  interval?: number;
  className?: string;
}

export const RotatingText = ({ 
  messages, 
  interval = 2000, 
  className 
}: RotatingTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsVisible(true);
      }, 150); // Brief pause for transition effect
      
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  if (messages.length === 0) return null;

  return (
    <span className={cn(
      "transition-all duration-150 ease-in-out",
      isVisible ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-1",
      className
    )}>
      {messages[currentIndex]}
    </span>
  );
};