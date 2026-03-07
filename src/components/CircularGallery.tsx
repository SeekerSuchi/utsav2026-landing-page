import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// ── Utility ─────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// ── Constants ────────────────────────────────────────────────────────────────
const ITEM_WIDTH  = 320
const ITEM_HEIGHT = 420
const GAP         = 24
const SPACING     = ITEM_WIDTH + GAP

// ── Default data (mirrors the OGL version) ───────────────────────────────────
const defaultItems = [
  { image: '/gallery/img1.webp',  text: '' },
  { image: '/gallery/img2.webp',  text: '' },
  { image: '/gallery/img3.webp',  text: 'Waterfall' },
  { image: '/gallery/img4.webp',  text: 'Strawberries' },
  { image: '/gallery/img5.webp',  text: 'Deep Diving' },
  { image: '/gallery/img6.webp',  text: 'Train Track' },
  { image: '/gallery/img7.webp',  text: 'Santorini' },
  { image: '/gallery/img8.webp',  text: 'Blurry Lights' },
  { image: '/gallery/img9.webp',  text: 'New York' },
  { image: '/gallery/img10.webp', text: 'Good Boy' },
  { image: '/gallery/img11.webp', text: 'Coastline' },
]

// ── Props (same interface as OGL version) ────────────────────────────────────
interface CircularGalleryProps {
  items?:           { image: string; text: string }[]
  bend?:            number   // arc intensity — same semantics as OGL bend prop
  textColor?:       string
  borderRadius?:    number   // fraction of item height (0.05 → ~21 px)
  font?:            string   // CSS font shorthand
  scrollSpeed?:     number   // drag sensitivity multiplier
  scrollEase?:      number   // lerp factor toward scroll target (0–1)
  autoScrollSpeed?: number   // base auto-scroll magnitude
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CircularGallery({
  items           = defaultItems,
  bend            = 3,
  textColor       = '#ffffff',
  borderRadius    = 0.05,
  font            = 'bold 20px sans-serif',
  scrollSpeed     = 5,
  scrollEase      = 0.05,
  autoScrollSpeed = 0.2,
}: CircularGalleryProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const trackRef      = useRef<HTMLDivElement>(null)
  const cardRefs      = useRef<(HTMLDivElement | null)[]>([])

  // Scroll state — same model as the OGL App.scroll object
  const scrollRef          = useRef({ current: 0, target: 0, last: 0 })
  const autoVelocityRef    = useRef(0)
  const isHoveringRef      = useRef(false)
  const isDraggingRef      = useRef(false)
  const dragStartXRef      = useRef(0)
  const dragStartTargetRef = useRef(0)

  // Duplicate items for seamless infinite loop
  const displayItems = [...items, ...items]
  const loopWidth    = items.length * SPACING

  // border-radius: fraction of item height → pixels
  const borderRadiusPx = Math.round(borderRadius * ITEM_HEIGHT)

  useEffect(() => {
    // ── Arc math — mirrors OGL Media.update() exactly ──────────────────────
    //   H  = half-container width  (≈ viewport.width/2 in OGL world units)
    //   B  = arc depth in the same unit (derived from bend + a px scale factor
    //        so bend=3 looks equivalent to the OGL default)
    //   R  = (H² + B²) / (2B)   — radius of the virtual arc circle
    //   arc = R - √(R² - effectiveX²)  — sagitta at position x
    // ───────────────────────────────────────────────────────────────────────
    const applyArcTransforms = (xOffset: number) => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      const H = containerWidth / 2

      // Scale bend to pixels.  bend*50 gives ≈150 px max dip at bend=3.
      const B = Math.abs(bend) * 50
      const R = B > 0 ? (H * H + B * B) / (2 * B) : Infinity

      cardRefs.current.forEach((el, i) => {
        if (!el) return

        // Signed distance of this card's centre from the container centre
        const cardCenterX = -xOffset + i * SPACING + ITEM_WIDTH / 2
        const dist        = cardCenterX - H
        const effectiveX  = Math.min(Math.abs(dist), H)

        let translateY = 0
        let rotateZ    = 0

        if (R < Infinity) {
          // Vertical dip along the arc (sagitta formula)
          const arc = R - Math.sqrt(R * R - effectiveX * effectiveX)

          // bend > 0 → arc dips downward (OGL: position.y = -arc)
          // bend < 0 → arc curves upward
          translateY = bend > 0 ? arc : -arc

          // Tangential rotation — same sign logic as OGL rotation.z
          // OGL:  rotation.z = -sign(x) * asin(effectiveX / R)
          // CSS:  rotate is the negative of OGL rotation.z (coordinate flip)
          const angle = Math.asin(Math.min(effectiveX / R, 1)) * (180 / Math.PI)
          rotateZ = bend > 0
            ? Math.sign(dist) * angle
            : -Math.sign(dist) * angle
        }

        // Fade cards that are far from the centre
        const normDist = Math.abs(dist) / (H * 1.2)
        const opacity  = Math.max(0.1, 1 - normDist * 0.7)

        el.style.transform = `translateY(${translateY}px) rotate(${rotateZ}deg)`
        el.style.opacity   = String(opacity)
      })
    }

    // ── GSAP ticker loop ───────────────────────────────────────────────────
    const tick = () => {
      const scroll = scrollRef.current

      // Auto-scroll: smooth ramp-up/down (mirrors OGL currentAutoScrollVelocity lerp)
      const targetVelocity = (!isHoveringRef.current && !isDraggingRef.current)
        ? autoScrollSpeed * 20   // scale to px/frame
        : 0
      autoVelocityRef.current = lerp(autoVelocityRef.current, targetVelocity, 0.05)
      scroll.target += autoVelocityRef.current

      // Ease scroll.current toward scroll.target (OGL scroll.ease)
      scroll.current = lerp(scroll.current, scroll.target, scrollEase)

      // Infinite loop via modulo — seamless because displayItems is 2× items
      const xOffset = ((scroll.current % loopWidth) + loopWidth) % loopWidth

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${-xOffset}px)`
      }

      applyArcTransforms(xOffset)
      scroll.last = scroll.current
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  // Stable deps — only recreate if these structural values change
  }, [loopWidth, bend, autoScrollSpeed, scrollEase])

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = () => { isHoveringRef.current = true }
  const handleMouseLeave = () => {
    isHoveringRef.current  = false
    isDraggingRef.current  = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current       = true
    dragStartXRef.current       = e.clientX
    dragStartTargetRef.current  = scrollRef.current.target
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const delta = dragStartXRef.current - e.clientX
    scrollRef.current.target = dragStartTargetRef.current + delta * scrollSpeed * 0.5
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab touch-none select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Edge fade-out overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-linear-to-r from-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-linear-to-l from-black/80 to-transparent" />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex items-center absolute top-1/2 -translate-y-1/2 will-change-transform"
        style={{ gap: `${GAP}px`, width: `${displayItems.length * SPACING}px` }}
      >
        {displayItems.map((item, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el }}
            className="relative flex-shrink-0 overflow-hidden border border-white/10
                       shadow-[0_25px_50px_rgba(0,0,0,0.6)] will-change-transform"
            style={{
              width:        ITEM_WIDTH,
              height:       ITEM_HEIGHT,
              borderRadius: borderRadiusPx,
            }}
          >
            <img
              src={item.image}
              alt={item.text}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Text label */}
            {item.text && (
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <p
                  className="font-medium text-xl tracking-wide drop-shadow"
                  style={{ color: textColor, font }}
                >
                  {item.text}
                </p>
                <div className="w-8 h-1 bg-fuchsia-500 rounded-full mt-2 opacity-80" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
