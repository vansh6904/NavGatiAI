import React from 'react';

const Board = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm ${className}`}
      {...props}
    />
  );
});
Board.displayName = "Board";

const BoardHeader = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  );
});
BoardHeader.displayName = "BoardHeader";

const BoardTitle = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
});
BoardTitle.displayName = "BoardTitle";

const BoardContent = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    />
  );
});
BoardContent.displayName = "BoardContent";

export { Board, BoardHeader, BoardTitle, BoardContent };