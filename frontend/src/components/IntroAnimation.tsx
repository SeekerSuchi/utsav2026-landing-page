import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  const palette = [
    '#ff5e57', '#ffa801', '#0fbcf9', '#b829ea', 
    '#ffd700', '#00e5ff', '#00ff88', '#ff00aa',
    '#ffffff', '#ff9f43', '#1dd1a1', '#feca57'
  ];

  const peopleCount = 12;
  const people = useMemo(() => {
    return Array.from({ length: peopleCount }).map((_, i) => ({
      id: i,
      color: palette[i % palette.length],
      rotation: i * 30, 
    }));
  }, []);

  const smoothEase = [0.25, 1, 0.5, 1];

  return (
    <motion.div
      // Kept bg-[#0f0510] as a fallback color while image loads
      className="fixed inset-0 z-[100] bg-[#0f0510] flex items-center justify-center overflow-hidden pointer-events-auto"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // This handles fading out both the SVG AND the new image seamlessly
      transition={{ duration: 1.2, ease: "easeInOut" }} 
    >
      
      {/* --- BACKGROUND IMAGE LAYER --- */}
      {/* PERFORMANCE FIX 1: transform: 'translateZ(0)' forces the image onto its own dedicated GPU layer */}
      <div className="absolute inset-0 z-0" style={{ transform: 'translateZ(0)' }}>
        <img 
          // Replace with your actual image path!
          src="option 3.png" 
          alt="Intro Background"
          className="w-full h-full object-cover"
          // PERFORMANCE FIX 2: Prevents image decoding from freezing the main animation thread
          decoding="async" 
        />
        {/* PERFORMANCE FIX 3: Removed 'mix-blend-multiply'. 
            A standard semi-transparent black overlay is 100x cheaper for the browser to render. */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>


      {/* SVG WRAPPER */}
      <motion.div
        // Added z-10 to ensure the SVG sits on top of the image layer
        className="w-full h-full absolute inset-0 flex items-center justify-center z-10"
        style={{ willChange: "transform" }}
        initial={{ scale: 1.8, rotate: 0 }}
        animate={{ scale: 0.8, rotate: 45 }}
        transition={{ duration: 6.5, ease: "easeOut" }}
      >
        <svg viewBox="-500 -500 1000 1000" className="w-full h-full overflow-visible">
          {people.map((person) => (
            <g key={person.id} style={{ transform: `rotate(${person.rotation}deg)` }}>
              <motion.g
                style={{ willChange: "transform, opacity"}}
                initial={{ y: -1200, opacity: 0 }}
                animate={{ y: -130, opacity: 1 }}
                transition={{ duration: 2.8, ease: smoothEase }} 
              >
                <circle cx="0" cy="0" r="10" fill={person.color} />
                <motion.path
                  d="M -32,4 Q 0,-12 32,4"
                  stroke={person.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.0, delay: 2.0, ease: "easeInOut" }}
                />
              </motion.g>
            </g>
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
};