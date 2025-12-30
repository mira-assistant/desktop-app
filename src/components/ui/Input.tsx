'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'px-3 py-2 rounded-lg border border-gray-300 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          'transition-all duration-200',
          'text-gray-900 placeholder:text-gray-400',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;