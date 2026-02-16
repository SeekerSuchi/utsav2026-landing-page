import React from 'react';

export const MandalaBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] animate-spin-slow origin-center">
        {/* Simple geometric Mandala representation using SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-fest-primary stroke-[0.2]">
           <circle cx="50" cy="50" r="40" />
           <circle cx="50" cy="50" r="30" className="stroke-fest-secondary" />
           <circle cx="50" cy="50" r="20" className="stroke-fest-accent" />
           {/* Radiating paths */}
           {[...Array(12)].map((_, i) => (
             <path 
               key={i} 
               d={`M50 50 L${50 + 45 * Math.cos(i * 30 * Math.PI / 180)} ${50 + 45 * Math.sin(i * 30 * Math.PI / 180)}`} 
               className="opacity-50"
             />
           ))}
           {/* Decorative dots */}
           {[...Array(24)].map((_, i) => (
             <circle 
                key={`dot-${i}`}
                cx={50 + 35 * Math.cos(i * 15 * Math.PI / 180)} 
                cy={50 + 35 * Math.sin(i * 15 * Math.PI / 180)} 
                r="0.5" 
                className="fill-fest-secondary stroke-none"
             />
           ))}
        </svg>
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-fest-bg via-transparent to-fest-bg" />
    </div>
  );
};