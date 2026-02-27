import LogoLoop from '../components/LogoLoop'
import ShinyText from '../components/ShinyText'
import { motion } from 'framer-motion'

const sponsors = [
  { src: 'https://placehold.co/400', alt: 'Sponsor 1' },
  { src: 'https://placehold.co/400', alt: 'Sponsor 2' },
  { src: 'https://placehold.co/400', alt: 'Sponsor 3' },
  { src: 'https://placehold.co/400', alt: 'Sponsor 4' },
  { src: 'https://placehold.co/400', alt: 'Sponsor 5' },
  { src: 'https://placehold.co/400', alt: 'Sponsor 6' },
  { src: 'https://placehold.co/400', alt: 'Sponsor 7' },
  { src: 'https://placehold.co/400', alt: 'Sponsor 8' },
]

export default function SponsorsSection() {
  return (
    <section className="relative w-full py-16 sm:py-20">
      <motion.h2
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-30 text-center font-cinzel text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-gray-200 via-gray-400 to-gray-600 drop-shadow-[0_0_15px_rgba(147,51,234,0.3)] sm:text-4xl"
      >
        <ShinyText
          text="Our Sponsors"
          speed={4}
          color="rgba(209,213,219,0.8)"
          shineColor="#ffffff"
          spread={120}
          yoyo
        />
      </motion.h2>

      <div style={{ height: '100px', position: 'relative', overflow: 'hidden' }}>
        <LogoLoop
          logos={sponsors}
          speed={80}
          direction="left"
          logoHeight={100}
          gap={100}
          hoverSpeed={0}
          fadeOut
          fadeOutColor="#07050a"
          ariaLabel="Our sponsors"
        />
      </div>
    </section>
  )
}
