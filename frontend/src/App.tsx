import React from 'react';
import HeroSection from './components/HeroSection';

function App() {
  return (
    // Main wrapper with the dark cultural background color
    <main className="w-full min-h-screen bg-fest-bg text-fest-text selection:bg-fest-accent selection:text-fest-bg">
      
      {/* Navigation Placeholder (Optional) */}
      <nav className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center mix-blend-difference pointer-events-none">
        <div className="font-bold tracking-widest text-sm pointer-events-auto cursor-pointer">
          UT.2025
        </div>
        <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest pointer-events-auto">
          <button className="hover:text-fest-primary transition-colors">EVENTS</button>
          <button className="hover:text-fest-primary transition-colors">GALLERY</button>
          <button className="hover:text-fest-primary transition-colors">TICKETS</button>
        </div>
      </nav>

      {/* The Immersive Hero Section */}
      <HeroSection />

      {/* Content Placeholder (To demonstrate scrolling) */}
      <section className="w-full py-20 px-8 flex flex-col items-center justify-center min-h-[50vh] bg-fest-bg/95 relative z-10">
        <p className="text-fest-text/50 max-w-md text-center leading-relaxed">
          The journey continues below. <br/>
          More components would be loaded here as the user scrolls.
        </p>
      </section>

    </main>
  );
}

export default App;