import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleText } from './ParticleText';
import { MandalaBackground } from './MandalaBackground';
import { motion } from 'framer-motion';

export default function Hero() {
  // Responsive scaling for the 3D text
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      // Simple logic to scale text down on mobile
      const w = window.innerWidth;
      if (w < 768) setScale(0.5);
      else setScale(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-fest-bg">
      
      {/* 1. Background Layer */}
      <MandalaBackground />

      {/* 2. The 3D Cinematic Scene */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            {/* Ambient light for subtle depth if we add meshes later */}
            <ambientLight intensity={0.5} />
            
            <group scale={[scale, scale, scale]}>
              <ParticleText text="UTSAV TRAYANA" size={1.5} />
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* 3. HTML Overlay for Subtitle & Accessibility */}
      {/* We use delay to match the 3D animation duration (~2.5s) */}
      <div className="absolute z-20 bottom-1/4 text-center px-4 w-full pointer-events-none">
        {/* Hidden H1 for Screen Readers (SEO/Accessibility) */}
        <h1 className="sr-only">Utsav Trayana: Echoes of Every Path</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1.5 }}
        >
          <h2 className="text-fest-secondary font-light tracking-[0.3em] uppercase text-sm md:text-lg lg:text-xl">
            Echoes of Every Path
          </h2>
          
          <div className="mt-4 h-px w-24 bg-linear-to-r from-transparent via-fest-accent to-transparent mx-auto opacity-70" />
        </motion.div>
      </div>

      {/* 4. Scroll Indicator (Optional) */}
      <motion.div 
        className="absolute bottom-8 z-20 text-fest-text opacity-50"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-2xl">↓</span>
      </motion.div>
      
    </section>
  );
}