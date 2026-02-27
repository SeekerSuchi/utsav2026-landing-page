import CircularGallery from '../components/CircularGallery'
import ShinyText from '../components/ShinyText'

const items = [
  { image: 'https://images.unsplash.com/photo-1709949908058-a08659bfa922?q=80&w=1200&auto=format', text: 'Utsav 2026' },
  { image: 'https://images.unsplash.com/photo-1548192746-dd526f154ed9?q=80&w=1200&auto=format', text: 'BMSCE' },
  { image: 'https://images.unsplash.com/photo-1693581176773-a5f2362209e6?q=80&w=1200&auto=format', text: 'Ananta' },
  { image: 'https://images.unsplash.com/photo-1584043204475-8cc101d6c77a?q=80&w=1200&auto=format', text: 'Culture' },
  { image: 'https://images.unsplash.com/photo-1709949908058-a08659bfa922?q=80&w=1200&auto=format', text: 'Creativity' },
  { image: 'https://images.unsplash.com/photo-1548192746-dd526f154ed9?q=80&w=1200&auto=format', text: 'Innovation' },
]

export default function GallerySection() {
  return (
    <section className="relative w-full py-10 md:py-20 overflow-hidden">
      <h2 className="text-center font-cinzel text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-gray-200 via-gray-400 to-gray-600 drop-shadow-[0_0_15px_rgba(147,51,234,0.3)] mb-8 md:mb-12">
        <ShinyText
          text="Gallery"
          speed={4}
          color="rgba(209,213,219,0.8)"
          shineColor="#ffffff"
          spread={120}
          yoyo
        />
      </h2>

      <div style={{ height: '600px', position: 'relative' }}>
        <CircularGallery
          items={items}
          bend={1}
          textColor="#ffffff"
          borderRadius={0.05}
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </div>
    </section>
  )
}