import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-sand-300 rounded-xl p-6 shadow-sm transition-shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
