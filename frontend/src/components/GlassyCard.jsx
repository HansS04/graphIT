import React from 'react';

function GlassyCard({ children, className = '' }) {
  return (
    <div
      className={`
    
        bg-text-graphit-white/10 .
        backdrop-blur-md
        border border-text-graphit-white
        rounded-lg
        shadow-lg
        p-6
        text-text-graphit-white

        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassyCard;