import React from 'react';

export const CosmicBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* 1. Deep Space Base Layer */}
      <div className="absolute inset-0 bg-[#0f0510]" />

      {/* 2. Moving Nebulas (Glowing Orbs) 
          We use 'animate-pulse' or custom slow spins to make them drift.
          'blur-3xl' creates the soft cosmic glow.
      */}
      
      {/* Primary Red/Pink Nebula (Top Left) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] 
        bg-fest-primary/20 rounded-full blur-[100px] mix-blend-screen 
        animate-[pulse_8s_ease-in-out_infinite]" 
      />

      {/* Secondary Gold/Orange Nebula (Bottom Right) */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] 
        bg-fest-secondary/10 rounded-full blur-[120px] mix-blend-screen 
        animate-[pulse_10s_ease-in-out_infinite_reverse]" 
      />

      {/* Accent Blue Nebula (Center/Floating) */}
      <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] 
        bg-fest-accent/10 rounded-full blur-[90px] mix-blend-screen 
        animate-[bounce_20s_infinite]" 
      />

      {/* 3. Star Field Overlay 
          Static tiny dots to give depth and texture 
      */}
      <div className="absolute inset-0 opacity-30" 
           style={{ 
             backgroundImage: 'radial-gradient(white 1px, transparent 1px)', 
             backgroundSize: '50px 50px' 
           }} 
      />
      
      {/* 4. Vignette for focus */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0f0510]/90" />
      
    </div>
  );
};