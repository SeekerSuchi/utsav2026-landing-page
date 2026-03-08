import { useRef, useEffect, useState, memo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_DATE = new Date('2026-04-17T00:00:00')
const START_VALUE = 999
const DIGIT_LABELS = ['0','1','2','3','4','5','6','7','8','9'] as const

// The Layer Stack from your LogoSection (Commented out for single image switch)
// const LAYERS = [
//   { file: 'logo-path8.svg',  zIndex: 7 },
//   { file: 'logo-path9.svg',  zIndex: 6 },
//   { file: 'logo-path10.svg', zIndex: 5 },
//   { file: 'logo-path11.svg', zIndex: 4 },
//   { file: 'logo-path12.svg', zIndex: 3 },
//   { file: 'logo-path13.svg', zIndex: 2 },
//   { file: 'logo-path14.svg', zIndex: 1 },
// ]

function getDaysLeft(): number {
  const now = new Date()
  const diff = EVENT_DATE.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const pad = (n: number, digits = 2): string => {
  const s = Math.max(0, Math.floor(n)).toString();
  return s.padStart(digits, '0');
};

function getTimeLeft() {
  const now  = new Date()
  const diff = Math.max(0, EVENT_DATE.getTime() - now.getTime())
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

// ── Components ───────────────────────────────────────────────────────────────

const RollNumber = memo(function RollNumber({ value, fontSize = 'clamp(2.5rem, 9vw, 7rem)' }: { value: string, fontSize?: string }) {
  const digits = value.split('')
  return (
    <span style={{ display: 'inline-flex', gap: '0.04em' }}>
      {digits.map((d, i) => (
        <RollDigit key={`${i}-${value.length}`} digit={d} fontSize={fontSize} />
      ))}
    </span>
  )
})

function RollDigit({ digit, fontSize }: { digit: string, fontSize: string }) {
  const trackRef = useRef<HTMLSpanElement>(null)
  const prevDigit = useRef<string>(digit)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const from = parseInt(prevDigit.current, 10)
    const to   = parseInt(digit, 10)
    
    // Safety check: ensure digits are valid numbers
    const safeFrom = isNaN(from) ? 0 : from;
    const safeTo = isNaN(to) ? 0 : to;

    if (safeFrom === safeTo) return;

    gsap.fromTo(track, 
      { y: `-${safeFrom}em` }, 
      { y: `-${safeTo}em`, duration: 0.45, ease: 'power3.out', overwrite: true }
    )
    prevDigit.current = digit
  }, [digit])

  return (
    <span style={{
      display: 'inline-block', overflow: 'hidden', height: '1em', lineHeight: '1em',
      verticalAlign: 'top', fontSize, fontFamily: '"Playfair Display", serif', fontWeight: 700,
      fontVariantNumeric: 'lining-nums tabular-nums', color: '#C0C0C0', position: 'relative',
    }}>
      <span ref={trackRef} style={{ display: 'flex', flexDirection: 'column', transform: `translateY(-${digit}em)`, willChange: 'transform' }}>
        {DIGIT_LABELS.map((n) => <span key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '1em' }}>{n}</span>)}
      </span>
    </span>
  )
}

const SubUnit = memo(function SubUnit({ value, label }: { value: number, label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
      <RollNumber value={pad(value)} fontSize='clamp(1.5rem, 5vw, 3.5rem)' />
      <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: 'clamp(0.55rem, 1vw, 0.72rem)', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D4AF37' }}>{label}</span>
    </div>
  )
})

// ── Section ──────────────────────────────────────────────────────────────────

export default function CountdownSection({ sectionRef }: { sectionRef?: React.RefObject<HTMLElement | null> }) {
  const internalRef  = useRef<HTMLElement>(null)
  const innerRef     = useRef<HTMLDivElement>(null)
  const logoContainerRef = useRef<HTMLDivElement>(null)
  
  // const layerRefs    = useRef<(HTMLImageElement | null)[]>([])
  const logoRef = useRef<HTMLImageElement>(null)
  
  const headlineRef  = useRef<HTMLParagraphElement>(null)
  const daysLabelRef = useRef<HTMLParagraphElement>(null)
  const subRowRef    = useRef<HTMLDivElement>(null)
  const bg1Ref       = useRef<HTMLDivElement>(null)

  const daysLeft = getDaysLeft()
  const [displayDays, setDisplayDays] = useState(START_VALUE)
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const section = (sectionRef ?? internalRef).current
    const inner   = innerRef.current
    const bg1     = bg1Ref.current
    // const layers  = layerRefs.current
    const logo    = logoRef.current
    
    if (!section || !inner || !bg1) return

    // Initial states
    gsap.set(inner, { opacity: 0, y: 40 })
    // gsap.set(layers, { opacity: 0, scale: 0.9, filter: 'blur(12px)' }) // Match your logo preloader start
    gsap.set(logo, { opacity: 0, scale: 0.9, filter: 'blur(12px)' }) 
    gsap.set([headlineRef.current, daysLabelRef.current, subRowRef.current], { opacity: 0, y: 20 })

    // Parallax Background
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'top 10%',
      scrub: 1.5,
      onUpdate: (self) => { gsap.set(bg1, { y: self.progress * -40 }) },
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    })

    // 1. Reveal Background & Headline
    tl.to(inner, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0)
    tl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.2)

    // 2. Animate Logo Layers (Staggered assembly) - Commented out
    // layers.forEach((layer, i) => {
    //   tl.to(layer, {
    //     opacity: 1,
    //     scale: 1,
    //     filter: 'blur(0px)',
    //     duration: 0.9,
    //     ease: 'power3.out'
    //   }, 0.1 + i * 0.15)
    // })

    // 2. Animate Logo (Single image reveal)
    tl.to(logo, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out'
    }, 0.2)

    // 3. Roll the days counter
    tl.call(() => {
      const obj = { val: START_VALUE }
      gsap.to(obj, {
        val: daysLeft,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate() { setDisplayDays(Math.round(obj.val)) },
      })
    }, [], 0.5)

    // 4. Reveal final labels
    tl.to(daysLabelRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.8)
    tl.to(subRowRef.current, { opacity: 1, y: 0, duration: 0.7 }, 1.1)

    return () => {
      ScrollTrigger.getAll().filter(t => t.vars.trigger === section).forEach(t => t.kill())
      tl.kill()
    }
  }, [sectionRef, daysLeft])

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section ref={sectionRef ?? internalRef} style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      
      {/* Background & Overlay */}
      <div ref={bg1Ref} style={{ position: 'absolute', inset: '-10% 0', backgroundImage: 'url(/wallhaven-yxy8zk_1920x1080.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,5,10,0.72) 0%, rgba(7,5,10,0.55) 50%, rgba(7,5,10,0.8) 100%)', zIndex: 2 }} />

      <div ref={innerRef} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '5vh' }}>
        
        <p ref={headlineRef} style={{ margin: '0 0 2rem 0', fontFamily: '"Cinzel", serif', fontWeight: 600, fontSize: 'clamp(1rem, 2.4vw, 1.45rem)', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Utsav · BMSCE · 2026
        </p>
        
        {/* MULTI-LAYERED LOGO (Commented out) */}
        {/* <div 
          ref={logoContainerRef} 
          style={{ 
            position: 'relative', 
            width: 'clamp(160px, 22vw, 320px)', 
            aspectRatio: '997.05 / 892.10',
            marginBottom: '2rem',
            marginTop: '1.5rem',
            transform: 'translate(4%, 4%)'
          }}
        >
          {LAYERS.map((layer, i) => (
            <img
              key={layer.file}
              ref={(el) => { layerRefs.current[i] = el }}
              src={`/${layer.file}`}
              alt=""
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                inset: 0,
                width: '90%',
                height: '120%',
                zIndex: layer.zIndex,
                userSelect: 'none',
                pointerEvents: 'none',
                display: 'block',
                // mixBlendMode: 'screen'
              }}
              draggable={false}
            />
          ))}
        </div>
        */}

        {/* SINGLE LOGO */}
        <div 
          ref={logoContainerRef} 
          style={{ 
            position: 'relative', 
            width: 'clamp(160px, 22vw, 320px)', 
            marginBottom: '2rem',
            marginTop: '1.5rem',
            transform: 'translate(-0.5%, 10%)' // Kept your manual nudge!
          }}
        >
          <img
            ref={logoRef}
            src="/u26 final logo.webp"
            alt="Utsav Logo"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>

        {/* Days Counter */}
        <div style={{ lineHeight: 1, }}>
          <RollNumber value={pad(displayDays, 3)} />
        </div>

        <p ref={daysLabelRef} style={{ margin: '0.9rem 0 2.8rem 0', fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: 'clamp(0.65rem, 1.3vw, 0.85rem)', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Days to go
        </p>

        <div style={{ width: 'min(380px, 60vw)', height: '1px', background: 'linear-gradient(to right, transparent, rgba(222,91,234,0.4), transparent)', marginBottom: '2.2rem' }} />

        <div ref={subRowRef} style={{ display: 'flex', gap: 'clamp(1.5rem, 5vw, 4rem)', alignItems: 'flex-end' }}>
          <SubUnit value={time.hours}   label="Hours"   />
          <SubUnit value={time.minutes} label="Minutes" />
          <SubUnit value={time.seconds} label="Seconds" />
        </div>
     
        <button className="explore-events-btn" style={{ marginTop: '1rem',marginBottom:"2rem" }}>
          Explore Events
        </button>
      </div>
    </section>
  )
}