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
  value: string       // e.g. "220" or "14"
  fontSize?: string
}

/** Vertically rolls digit columns to the target value. */
const RollNumber = memo(function RollNumber({ value, fontSize = 'clamp(5rem, 14vw, 10rem)' }: RollProps) {
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
    // Each digit in the track is 1em tall (set via lineHeight)
    // We animate Y from -from*1em to -to*1em
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
      {/* Track: 10 digits (0-9) stacked vertically, each 1em */}
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
      <RollNumber value={pad(value)} fontSize='clamp(2rem, 5vw, 3.5rem)' />
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
}

const headlineStyle: React.CSSProperties = {
  margin: '0 0 2.4rem 0',
  fontFamily: '"Cinzel", "Playfair Display", serif',
  fontWeight: 600,
  fontSize: 'clamp(1rem, 2.4vw, 1.45rem)',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
color: '#D4AF37',}

const daysCounterStyle: React.CSSProperties = { lineHeight: 1, marginBottom: '0.5rem' }

const daysLabelStyle: React.CSSProperties = {
  margin: '0.9rem 0 2.8rem 0',
  fontFamily: '"Inter", sans-serif',
  fontWeight: 300,
  fontSize: 'clamp(0.65rem, 1.3vw, 0.85rem)',
  letterSpacing: '0.38em',
  textTransform: 'uppercase',
color: '#D4AF37',}

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
  const headlineRef  = useRef<HTMLParagraphElement>(null)
  const daysLabelRef = useRef<HTMLParagraphElement>(null)
  const subRowRef    = useRef<HTMLDivElement>(null)
  const bg1Ref       = useRef<HTMLDivElement>(null)

  // Reverse-countdown display value (animates from START_VALUE down to actual days)
  const daysLeft    = getDaysLeft()
  const [displayDays, setDisplayDays] = useState(START_VALUE)

  // Live clock state
  const [time, setTime] = useState(getTimeLeft)

  // ── Entrance: parallax bg + content fade-in ───────────────────────────────
  useEffect(() => {
    const section = (sectionRef ?? internalRef).current
    const inner   = innerRef.current
    const bg1     = bg1Ref.current
    const headline   = headlineRef.current
    const daysLabel  = daysLabelRef.current
    const subRow     = subRowRef.current
    if (!section || !inner || !bg1 || !headline || !daysLabel || !subRow) return

    // Initial states
    gsap.set(inner,    { opacity: 0, y: 40 })
    gsap.set(headline, { opacity: 0, y: 24 })
    gsap.set(daysLabel,{ opacity: 0, y: 16 })
    gsap.set(subRow,   { opacity: 0, y: 20 })

    // ── BG parallax on scroll ──
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'top 10%',
      scrub: 1.5,
      onUpdate: (self) => {
        gsap.set(bg1, { y: self.progress * -40 })
      },
    })

    // ── Content entrance (scroll-triggered one-shot) ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.to(inner,    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0)
    tl.to(headline, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.15)

    // ── Reverse countdown: days roll from START_VALUE → actual ──
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
    }, [], 0.3)

    tl.to(daysLabel, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.5)
    tl.to(subRow,    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.8)

    return () => {
      ScrollTrigger.getAll()
        .filter((t) => t.vars.trigger === section)
        .forEach((t) => { t.kill() })
      tl.kill()
    }
  }, [sectionRef, daysLeft])

  // ── Live clock tick ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef ?? internalRef}
      style={sectionStyle}
    >
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
