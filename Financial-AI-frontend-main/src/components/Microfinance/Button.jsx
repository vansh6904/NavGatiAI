import React from 'react';

const Button = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 h-10 py-2 px-4 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export default Button;