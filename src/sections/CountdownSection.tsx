import { useRef, useEffect, useState, memo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_DATE = new Date('2026-04-17T00:00:00')

// Hoisted outside component — never changes
const START_VALUE = 999
const DIGIT_LABELS = ['0','1','2','3','4','5','6','7','8','9'] as const
function getDaysLeft(): number {
  const now = new Date()
  const diff = EVENT_DATE.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function pad(n: number, digits = 2): string {
  return String(n).padStart(digits, '0')
}

function getTimeLeft() {
  const now  = new Date()
  const diff = Math.max(0, EVENT_DATE.getTime() - now.getTime())
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

// ── Roll number component ─────────────────────────────────────────────────────

interface RollProps {
  value: string       
  fontSize?: string
}

const RollNumber = memo(function RollNumber({ value, fontSize = 'clamp(3.5rem, 12vw, 10rem)' }: RollProps) {
  const digits = value.split('')
  return (
    <span style={{ display: 'inline-flex', gap: '0.04em' }}>
      {digits.map((d, i) => (
        <RollDigit key={`${i}-${value.length}`} digit={d} fontSize={fontSize} />
      ))}
    </span>
  )
})

interface RollDigitProps {
  digit: string
  fontSize: string
}

function RollDigit({ digit, fontSize }: RollDigitProps) {
  const trackRef = useRef<HTMLSpanElement>(null)
  const prevDigit = useRef<string>(digit)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const from = parseInt(prevDigit.current, 10)
    const to   = parseInt(digit, 10)
    if (isNaN(from) || isNaN(to) || from === to) {
      prevDigit.current = digit
      return
    }
    gsap.fromTo(
      track,
      { y: `-${from}em` },
      { y: `-${to}em`, duration: 0.45, ease: 'power3.out' }
    )
    prevDigit.current = digit
  }, [digit])

  return (
    <span style={{
      display: 'inline-block',
      overflow: 'hidden',
      height: '1em',
      lineHeight: '1em',
      verticalAlign: 'top',
      fontSize,
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontVariantNumeric: 'lining-nums tabular-nums',
      fontFeatureSettings: '"lnum" 1, "tnum" 1',
      color: '#C0C0C0',
      position: 'relative',
    }}>
      <span
        ref={trackRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(-${digit}em)`,
          lineHeight: '1em',
          willChange: 'transform',
        }}
      >
        {DIGIT_LABELS.map((n) => (
          <span
            key={n}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '1em',
              lineHeight: '1em',
              overflow: 'hidden',
            }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}

// ── Sub-unit display (hours / minutes / seconds) ──────────────────────────────

interface UnitProps {
  value: number
  label: string
}

const subUnitLabelStyle: React.CSSProperties = {
  fontFamily: '"Inter", sans-serif',
  fontWeight: 300,
  fontSize: 'clamp(0.55rem, 1vw, 0.72rem)',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37'
}

const subUnitContainerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
}

const SubUnit = memo(function SubUnit({ value, label }: UnitProps) {
  return (
    <div style={subUnitContainerStyle}>
      <RollNumber value={pad(value)} fontSize='clamp(1.5rem, 5vw, 3.5rem)' />
      <span style={subUnitLabelStyle}>{label}</span>
    </div>
  )
})

// ── Hoisted styles ────────────────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  zIndex: 0,
}

const bgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: '-10% 0',
  backgroundImage: 'url(/wallhaven-yxy8zk_1920x1080.webp)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  zIndex: 0,
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, rgba(7,5,10,0.72) 0%, rgba(7,5,10,0.55) 50%, rgba(7,5,10,0.8) 100%)',
  zIndex: 2,
  pointerEvents: 'none',
}

const contentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
  padding: '2rem 1.5rem',
  textAlign: 'center',
  marginTop: '8vh', // Helps shift the entire block down relative to the viewport
}

// Added new Logo Style
const logoStyle: React.CSSProperties = {
  width: 'clamp(120px, 18vw, 250px)', 
  height: 'auto',
  marginBottom: '1rem', 
  
  // ADD THIS to push the logo down:
  marginTop: '3rem', // Increase to 4rem or 5rem if you want it even lower!
  
  objectFit: 'contain',
  mixBlendMode: 'screen',
  // Removed the transform property so GSAP can do its job without conflicts
}

const headlineStyle: React.CSSProperties = {
  // FIXED typo here (changed '2' to '0'):
  margin: '2rem 0 2.4rem 0', 
  fontFamily: '"Cinzel", "Playfair Display", serif',
  fontWeight: 600,
  fontSize: 'clamp(1rem, 2.4vw, 1.45rem)',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#D4AF37',
}

const daysCounterStyle: React.CSSProperties = { lineHeight: 1, marginBottom: '0.5rem' }

const daysLabelStyle: React.CSSProperties = {
  margin: '0.9rem 0 2.8rem 0',
  fontFamily: '"Inter", sans-serif',
  fontWeight: 300,
  fontSize: 'clamp(0.65rem, 1.3vw, 0.85rem)',
  letterSpacing: '0.38em',
  textTransform: 'uppercase',
  color: '#D4AF37',
}

const separatorStyle: React.CSSProperties = {
  width: 'min(380px, 60vw)',
  height: '1px',
  background: 'linear-gradient(to right, transparent, rgba(222,91,234,0.4), transparent)',
  marginBottom: '2.2rem',
}

const subRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'clamp(1.5rem, 5vw, 4rem)',
  alignItems: 'flex-end',
}

// ── Section ───────────────────────────────────────────────────────────────────

interface CountdownSectionProps {
  sectionRef?: React.RefObject<HTMLElement | null>
}

export default function CountdownSection({ sectionRef }: CountdownSectionProps) {
  const internalRef  = useRef<HTMLElement>(null)
  const innerRef     = useRef<HTMLDivElement>(null)
  const logoRef      = useRef<HTMLImageElement>(null) // New ref for Logo animation
  const headlineRef  = useRef<HTMLParagraphElement>(null)
  const daysLabelRef = useRef<HTMLParagraphElement>(null)
  const subRowRef    = useRef<HTMLDivElement>(null)
  const bg1Ref       = useRef<HTMLDivElement>(null)

  const daysLeft    = getDaysLeft()
  const [displayDays, setDisplayDays] = useState(START_VALUE)

  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const section = (sectionRef ?? internalRef).current
    const inner   = innerRef.current
    const logo    = logoRef.current
    const bg1     = bg1Ref.current
    const headline   = headlineRef.current
    const daysLabel  = daysLabelRef.current
    const subRow     = subRowRef.current
    
    if (!section || !inner || !bg1 || !headline || !daysLabel || !subRow || !logo) return

    // Initial states (added logo)
    gsap.set(inner,    { opacity: 0, y: 40 })
    gsap.set(logo,     { opacity: 0, y: 20, scale: 0.9 })
    gsap.set(headline, { opacity: 0, y: 24 })
    gsap.set(daysLabel,{ opacity: 0, y: 16 })
    gsap.set(subRow,   { opacity: 0, y: 20 })

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'top 10%',
      scrub: 1.5,
      onUpdate: (self) => {
        gsap.set(bg1, { y: self.progress * -40 })
      },
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.to(inner,    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0)
    // Animate logo first
    tl.to(logo,     { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.1)
    tl.to(headline, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.25)

    tl.call(() => {
      const obj = { val: START_VALUE }
      gsap.to(obj, {
        val: daysLeft,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate() {
          setDisplayDays(Math.round(obj.val))
        },
      })
    }, [], 0.4) // Slightly delayed to accommodate the logo

    tl.to(daysLabel, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.6)
    tl.to(subRow,    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.9)

    return () => {
      ScrollTrigger.getAll()
        .filter((t) => t.vars.trigger === section)
        .forEach((t) => { t.kill() })
      tl.kill()
    }
  }, [sectionRef, daysLeft])

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section ref={sectionRef ?? internalRef} style={sectionStyle}>
      {/* Wallpaper BG 1 */}
      <div ref={bg1Ref} style={bgStyle} />

      {/* Dark overlay for legibility */}
      <div style={overlayStyle} />

      {/* Content wrapper */}
      <div ref={innerRef} style={contentStyle}>
        {/* Headline */}
        <p ref={headlineRef} style={headlineStyle}>
          Utsav · BMSCE · 2026
        </p>
        
        {/* LOGO ADDED HERE */}
        <img 
          ref={logoRef}
          src="/U26 LOGO-02.png" 
          alt="Utsav 2026 Logo" 
          style={logoStyle} 
        />

        

        {/* Giant days counter */}
        <div style={daysCounterStyle}>
          <RollNumber value={pad(displayDays, 3)} />
        </div>

        {/* "DAYS TO GO" label */}
        <p ref={daysLabelRef} style={daysLabelStyle}>
          Days to go
        </p>

        {/* Thin separator */}
        <div style={separatorStyle} />

        {/* Hours / Minutes / Seconds row */}
        <div ref={subRowRef} style={subRowStyle}>
          <SubUnit value={time.hours}   label="Hours"   />
          <SubUnit value={time.minutes} label="Minutes" />
          <SubUnit value={time.seconds} label="Seconds" />
        </div>
     
        {/* Explore Events Button */}
        <button className="explore-events-btn">
          Explore Events
        </button>
      </div>
    </section>
  )
}