import React, { useState } from 'react';
import type { SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ShinyText from '../components/ShinyText';

const items = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1709949908058-a08659bfa922?q=80&w=1200&auto=format',
    title: 'Misty Mountain Majesty',
    description: 'A breathtaking view of misty mountains shrouded in clouds, creating an ethereal landscape.',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1548192746-dd526f154ed9?q=80&w=1200&auto=format',
    title: 'Winter Wonderland',
    description: "A serene winter scene with snow-covered trees and mountains, showcasing nature's pristine beauty.",
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1693581176773-a5f2362209e6?q=80&w=1200&auto=format',
    title: 'Autumn Mountain Retreat',
    description: 'A cozy cabin nestled in the mountains, surrounded by the vibrant colors of autumn foliage.',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1584043204475-8cc101d6c77a?q=80&w=1200&auto=format',
    title: 'Tranquil Lake Reflection',
    description: 'A calm mountain lake perfectly reflecting the surrounding peaks and sky, creating a mirror-like surface.',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1709949908058-a08659bfa922?q=80&w=1200&auto=format',
    title: 'Misty Mountain Peaks',
    description: "Majestic mountain peaks emerging from a sea of clouds, showcasing nature's grandeur.",
  },
];

const articleVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 15,
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

type Item = {
  id: number;
  url: string;
  title: string;
  description: string;
};

interface GalleryProps {
  items: Item[];
  setIndex: React.Dispatch<SetStateAction<number>>;
  index: number | undefined;
}

function Gallery({ items, setIndex, index }: GalleryProps) {
  return (
    <div className="w-full max-w-350 mx-auto gap-2 sm:gap-4 flex flex-col md:flex-row pb-10 md:pb-20 pt-10 px-4 justify-center">
      {items.slice(0, 5).map((item: Item, i: number) => {
        const isActive = index === i;
        return (
          <motion.div
            whileTap={{ scale: 0.98 }}
            className={`rounded-3xl relative shrink-0 transition-all ease-[cubic-bezier(0.25,1,0.5,1)] duration-700 origin-center overflow-hidden flex items-end ${
              isActive 
                ? 'w-full h-80 md:w-150 lg:w-200 md:h-125 lg:h-175 shadow-[0_0_40px_rgba(147,51,234,0.15)] border border-white/20 grayscale-0' 
                : 'w-full h-20 md:w-20 lg:w-25 md:h-125 lg:h-175 opacity-60 hover:opacity-100 grayscale-[0.8] hover:grayscale-0 border border-transparent cursor-pointer'
            }`}
            key={i}
            onClick={() => setIndex(i)}
            onMouseEnter={() => setIndex(i)}
            role="button"
            tabIndex={0}
          >
            <img
              src={item?.url}
              alt={item?.title}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
                isActive ? 'scale-100' : 'scale-125'
              }`}
            />
            
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.article
                  variants={articleVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="relative z-10 w-full p-4 sm:p-6 md:p-8 bg-black/50 backdrop-blur-md border-t border-white/10 text-white"
                >
                  <motion.h3
                    variants={articleVariants}
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-cinzel font-bold tracking-tight mb-2 md:mb-3"
                  >
                    {item?.title}
                  </motion.h3>
                  <motion.p
                    variants={articleVariants}
                    className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed max-w-2xl font-light"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                  >
                    {item?.description}
                  </motion.p>
                </motion.article>
              )}
            </AnimatePresence>

            {/* Dark overlay for inactive states to make the active one pop more */}
            <div className={`absolute inset-0 bg-black transition-opacity duration-700 pointer-events-none ${isActive ? 'opacity-0' : 'opacity-40'}`} />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function GallerySection() {
  const [index, setIndex] = useState(2);

  return (
    <section className="relative w-full py-10 md:py-20 overflow-hidden">
      {/* Restored ShinyText Header */}
      <motion.h2
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center font-cinzel text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-gray-200 via-gray-400 to-gray-600 drop-shadow-[0_0_15px_rgba(147,51,234,0.3)] mb-8 md:mb-12"
      >
        <ShinyText
          text="Gallery"
          speed={4}
          color="rgba(209,213,219,0.8)"
          shineColor="#ffffff"
          spread={120}
          yoyo
        />
      </motion.h2>

      <Gallery items={items} index={index} setIndex={setIndex} />
    </section>
  );
}