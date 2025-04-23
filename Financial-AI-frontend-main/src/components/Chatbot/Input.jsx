import React from 'react';
import {cn} from '../ui/utils';

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-lg border bg-transparent px-4 py-3",
      "text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-teal-400/30 focus-visible:border-teal-400",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-300",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };