import React from 'react';

const Select = React.forwardRef(({ className = "", children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

const SelectOption = React.forwardRef(({ className = "", ...props }, ref) => {
  return <option ref={ref} className={`text-gray-900 ${className}`} {...props} />;
});
SelectOption.displayName = "SelectOption";

export { Select, SelectOption };
