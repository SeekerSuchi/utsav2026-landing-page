import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface LogoSectionProps {
  /** Called once the logo reveal + fade-out finishes */
  onAnimationComplete?: () => void
}

const LAYERS = [
  { file: 'logo-path8.svg',  color: '#50096d', label: 'silhouette' },
  { file: 'logo-path9.svg',  color: '#6c228f', label: 'shadow' },
  { file: 'logo-path10.svg', color: '#62676e', label: 'dark-gray' },
  { file: 'logo-path11.svg', color: '#9028af', label: 'purple' },
  { file: 'logo-path12.svg', color: '#79868a', label: 'mid-gray' },
  { file: 'logo-path13.svg', color: '#969a9f', label: 'light-gray' },
  { file: 'logo-path14.svg', color: '#de5bea', label: 'magenta' },
]

const STACK_Z: Record<string, number> = {
  'logo-path8.svg':  7,
  'logo-path9.svg':  6,
  'logo-path10.svg': 5,
  'logo-path11.svg': 4,
  'logo-path12.svg': 3,
  'logo-path13.svg': 2,
  'logo-path14.svg': 1,
}

export default function LogoSection({ onAnimationComplete }: LogoSectionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const layerRefs  = useRef<(HTMLImageElement | null)[]>([])
  const glowRef    = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const lineRef    = useRef<HTMLDivElement>(null)
  const navLogoRef = useRef<HTMLDivElement>(null)
  const logoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay        = overlayRef.current
    const layers         = layerRefs.current
    const glow           = glowRef.current
    const tagline        = taglineRef.current
    const line           = lineRef.current
    const navLogo        = navLogoRef.current
    const logoContainer  = logoContainerRef.current
    if (!overlay || layers.some((l) => !l) || !glow || !tagline || !line || !navLogo || !logoContainer) return

    layers.forEach((el) => {
      gsap.set(el, { opacity: 0, scale: 0.94, filter: 'blur(12px)' })
    })
    gsap.set(glow,    { opacity: 0, scale: 0.5 })
    gsap.set(tagline, { opacity: 0, y: 16 })
    gsap.set(line,    { scaleX: 0, opacity: 0 })
    gsap.set(navLogo, { opacity: 0, x: -20, scale: 0.6 })

    // Auto-playing timeline (no scroll trigger)
    const tl = gsap.timeline({
      onComplete: () => {
        onAnimationComplete?.()

        // ── Fly-to-nav animation ──────────────────────────────────
        const logoRect = logoContainer.getBoundingClientRect()
        const navRect  = navLogo.getBoundingClientRect()

        // 1. Set logo container to fixed at its exact current viewport position,
        //    then move it outside the overlay so it survives the overlay fade-out.
        gsap.set(logoContainer, {
          position: 'fixed',
          top:      logoRect.top,
          left:     logoRect.left,
          width:    logoRect.width,
          height:   logoRect.height,
          zIndex:   200,
          margin:   0,
        })
        document.body.appendChild(logoContainer)

        // 2. Fade out decorative elements + overlay background
        gsap.to([glow, line, tagline], { opacity: 0, duration: 0.35, ease: 'power2.out' })
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.5,
          delay: 0.1,
          ease: 'power2.inOut',
          onComplete: () => { overlay.style.display = 'none' },
        })

        // 3. Brief pause then fly the logo to the nav position
        const logoCx = logoRect.left + logoRect.width  / 2
        const logoCy = logoRect.top  + logoRect.height / 2
        const navCx  = navRect.left  + navRect.width   / 2
        const navCy  = navRect.top   + navRect.height  / 2
        const flyScale = navRect.width / logoRect.width

        gsap.to(logoContainer, {
          x: navCx - logoCx,
          y: navCy - logoCy,
          scale: flyScale,
          transformOrigin: '50% 50%',
          duration: 0.85,
          delay: 0.45,
          ease: 'power3.inOut',
          onComplete: () => {
            // Snap the static nav logo in and remove the flying clone
            gsap.set(navLogo, { opacity: 1, x: 0, scale: 1 })
            logoContainer.style.display = 'none'
          },
        })
      },
    })

    tl.to(glow, {
      opacity: 0.6, scale: 1.6,
      duration: 1.8, ease: 'power2.out',
    }, 0)

    tl.to(layers[0], {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      duration: 1.1, ease: 'expo.out',
    }, 0.1)

    for (let i = 1; i <= 5; i++) {
      tl.to(layers[i], {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.9, ease: 'power3.out',
      }, 0.1 + i * 0.28)
    }

    tl.to(glow, {
      scale: 1.1, opacity: 0.5,
      duration: 1.2, ease: 'power2.inOut',
    }, 0.8)

    tl.to(layers[6], {
      opacity: 1, scale: 1.04, filter: 'blur(0px)',
      duration: 0.5, ease: 'power4.out',
    }, 0.1 + 6 * 0.28)

    tl.to(layers[6], {
      scale: 1,
      duration: 0.6, ease: 'elastic.out(1, 0.6)',
    }, 0.1 + 6 * 0.28 + 0.5)

    tl.to(glow, {
      opacity: 0.9, scale: 1.25,
      duration: 0.35, ease: 'power4.out',
    }, 0.1 + 6 * 0.28)

    tl.to(glow, {
      opacity: 0.3, scale: 1.0,
      duration: 1.4, ease: 'power2.inOut',
    }, 0.1 + 6 * 0.28 + 0.35)

    tl.to(layers, {
      scale: 1.015,
      duration: 0.4, ease: 'sine.inOut',
      stagger: 0,
    }, 0.1 + 6 * 0.28 + 0.6)
    tl.to(layers, {
      scale: 1,
      duration: 0.5, ease: 'sine.inOut',
      stagger: 0,
    }, 0.1 + 6 * 0.28 + 1.0)

    const lineStart = 0.1 + 6 * 0.28 + 0.7
    tl.to(line, {
      scaleX: 1, opacity: 1,
      duration: 0.8, ease: 'power3.out',
    }, lineStart)

    tl.to(tagline, {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out',
    }, lineStart + 0.2)

    return () => {
      tl.kill()
    }
  }, [onAnimationComplete])

  return (
    <>
      {/* Persistent navbar logo (fixed, top-left) */}
      <div
        ref={navLogoRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: '1.1rem',
          left: '1.4rem',
          zIndex: 100,
          width: '52px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'relative', width: '52px', aspectRatio: '997.05 / 892.10' }}>
          {LAYERS.map((layer, i) => (
            <img
              key={layer.file}
              src={`/${layer.file}`}
              alt=""
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                zIndex: STACK_Z[layer.file],
                userSelect: 'none',
              }}
              draggable={false}
            />
          ))}
        </div>
      </div>

      {/* Loading overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: '#07050a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 65% 65% at 50% 50%, #150d22 0%, #07050a 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }} />

        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            width: '60vmin',
            height: '60vmin',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(144,40,175,0.5) 0%, rgba(222,91,234,0.22) 40%, transparent 70%)',
            filter: 'blur(40px)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        <div
          ref={logoContainerRef}
          style={
          {
          position: 'relative',
          zIndex: 2,
          width: 'min(70vmin, 500px)',
          aspectRatio: '997.05 / 892.10',
          }}>
          {LAYERS.map((layer, i) => (
            <img
              key={layer.file}
              ref={(el) => { layerRefs.current[i] = el }}
              src={`/${layer.file}`}
              alt=""
              aria-hidden={i < LAYERS.length - 1 ? true : undefined}
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                zIndex: STACK_Z[layer.file],
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              draggable={false}
            />
          ))}
          <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            Utsav 2026 — BMSCE
          </span>
        </div>

        <div style={{
          position: 'relative',
          zIndex: 2,
          marginTop: '2.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.9rem',
          width: 'min(70vmin, 500px)',
        }}>
          <div
            ref={lineRef}
            style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(222,91,234,0.5), transparent)',
              transformOrigin: 'center',
            }}
          />
          <p
            ref={taglineRef}
            style={{
              margin: 0,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(0.65rem, 1.2vw, 0.82rem)',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(222, 91, 234, 0.7)',
            }}
          >
            Utsav · BMSCE · 2026
          </p>
        </div>
      </div>
    </>
  )
}
