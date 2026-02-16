import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { ParticleText } from './ParticleText';
// import { MandalaBackground } from './MandalaBackground'; // REMOVE THIS
import { CosmicBackground } from './CosmicBackground';    // ADD THIS

const HeroSection: React.FC = () => {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) setScale(0.45);
      else if (w < 1024) setScale(0.7);
      else setScale(1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0f0510]">
      
      {/* ------------------------------------------------------
          LAYER 1: New Cosmic Background
          ------------------------------------------------------ */}
      <CosmicBackground />

      {/* ------------------------------------------------------
          LAYER 2: 3D Scene (WebGL)
          ------------------------------------------------------ */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <group scale={[scale, scale, scale]}>
              {/* Note: Ensure you are using the LATEST ParticleText code from the previous step */}
              <ParticleText text="UTSAV TRAYANA" size={1.2} density={1500} />
            </group>
            
            {/* Subtle fog to blend distant particles into the cosmic void */}
            <fog attach="fog" args={['#0f0510', 5, 25]} />
          </Suspense>
        </Canvas>
      </div>

      {/* ------------------------------------------------------
          LAYER 3: HTML Overlay (Accessibility & Subtitles)
          ------------------------------------------------------ */}
      <div className="absolute z-20 bottom-[20%] md:bottom-[15%] text-center px-4 w-full pointer-events-none select-none">
        
        <h1 className="sr-only">Utsav Trayana: Echoes of Every Path</h1>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 3.5, duration: 1.5, ease: "easeOut" }} // Delayed to let stars arrive first
          className="flex flex-col items-center"
        >
          <h2 className="text-fest-secondary font-light tracking-[0.2em] md:tracking-[0.5em] uppercase text-xs md:text-lg lg:text-xl drop-shadow-lg shadow-black">
            Echoes of Every Path
          </h2>
          <div className="mt-6 h-px w-16 md:w-24 bg-linear-to-r from-transparent via-fest-accent to-transparent opacity-70" />
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-8 z-20 text-white/30 mix-blend-screen"
        animate={{ y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-sm uppercase tracking-widest text-[10px]">Scroll to Explore</span>
        <div className="w-px h-8 bg-white mx-auto mt-2 opacity-50"></div>
      </motion.div>
      
    </section>
  );
};

export default HeroSection;