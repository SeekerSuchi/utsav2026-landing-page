import { lazy, Suspense } from 'react'
import LogoSection from './sections/LogoSection'
import CountdownSection from './sections/CountdownSection'
import LightPillar from './components/LightPillar'
import './index.css'

// Lazy-load below-fold sections to reduce initial bundle size
const ThemeAboutSection = lazy(() => import('./sections/ThemeAboutSection'))
const GallerySection    = lazy(() => import('./sections/GallerySection'))
// const SponsorsSection   = lazy(() => import('./sections/SponsorsSection'))
const PatronsSection    = lazy(() => import('./sections/PatronsSection'))
const ContactSection    = lazy(() => import('./sections/ContactSection'))
const FooterSection     = lazy(() => import('./sections/FooterSection'))

export default function App() {
  return (
    <div style={{ background: '#07050a' }}>
      {/* Fixed LightPillar background behind all sections */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <LightPillar
            topColor="#5227FF"
            bottomColor="#FF9FFC"
            intensity={1}
            rotationSpeed={1}
            glowAmount={0.002}
            pillarWidth={3}
            pillarHeight={0.4}
            noiseIntensity={0.5}
            pillarRotation={25}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <LogoSection />
        <CountdownSection />
        <Suspense fallback={null}>
          <ThemeAboutSection />
        </Suspense>
        <Suspense fallback={null}>
          <GallerySection />
        </Suspense>
        <Suspense fallback={null}>
          <PatronsSection />
        </Suspense>
        <Suspense fallback={null}>
          <ContactSection />
          <FooterSection />
        </Suspense>
      </div>
    </div>
  )
}
