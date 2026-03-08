import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface CircularGalleryProps {
  items: { image: string; text: string }[]
  isPaused?: boolean
}

// ── CONFIGURATION ──
const SCROLL_LERP = 0.06
const AUTO_SCROLL_SPEED = 1.5
const POP_LERP = 0.05 

export default function CircularGallery({
  items,
  isPaused = false,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]) 
  const titleRef = useRef<HTMLParagraphElement>(null)

  // Layout & Interaction State
  const [layout, setLayout] = useState({ slideWidth: 280, slideHeight: 380, isMobile: false })
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Scroll & Animation Refs
  const scrollTarget = useRef(0)
  const scrollCurrent = useRef(0)
  const isPausedRef = useRef(isPaused)
  const activeIndexRef = useRef(-1)
  
  // Drag Refs
  const isDragging = useRef(false)
  const hasDragged = useRef(false) 
  const touchStartX = useRef(0)

  // ── OPTIMIZATION CACHES ──
  const dims = useRef({ width: 0, height: 0, cx: 0, arcBaselineY: 0, slideGap: 300, trackWidth: 0 })
  const offsetsRef = useRef<number[]>([]) 
  const popValuesRef = useRef<number[]>([]) 
  const globalPopRef = useRef(0) 
  
  // Caches pre-calculated target widths/heights so we don't read DOM properties inside the 60fps loop
  const targetSizesRef = useRef<{ w: number, h: number }[]>([])
  
  // Caches the exact string values currently applied to the DOM to prevent Layout Thrashing
  const lastStylesRef = useRef<{ w: string, h: string, t: string, o: string, z: string }[]>([])

  const displayItems = [...items, ...items, ...items]

  // Initialize tracking arrays
  if (popValuesRef.current.length !== displayItems.length) {
    popValuesRef.current = new Array(displayItems.length).fill(0)
    offsetsRef.current = new Array(displayItems.length).fill(0)
    lastStylesRef.current = Array(displayItems.length).fill(null).map(() => ({ w: '', h: '', t: '', o: '', z: '' }))
  }

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  // Handle Resize and Dimensions
  useEffect(() => {
    const updateDims = () => {
      const w = containerRef.current?.offsetWidth || window.innerWidth
      const h = containerRef.current?.offsetHeight || window.innerHeight
      const isMobile = w < 768
      
      const slideWidth = isMobile ? w * 0.6 : 280
      const slideHeight = isMobile ? slideWidth * 1.3 : 380
      const slideGap = isMobile ? w * 0.5 : w * 0.15 

      setLayout({ slideWidth, slideHeight, isMobile })

      dims.current = {
        width: w,
        height: h,
        cx: w / 2,
        arcBaselineY: isMobile ? h * 0.4 : h * 0.45,
        slideGap,
        trackWidth: displayItems.length * slideGap
      }

      // Clear size cache on resize so it recalculates perfectly for the new screen dimensions
      targetSizesRef.current = []
    }
    
    updateDims()
    window.addEventListener('resize', updateDims)
    return () => window.removeEventListener('resize', updateDims)
  }, [displayItems.length])

  // Core Animation Loop
  useEffect(() => {
    const animate = () => {
      const dt = gsap.ticker.deltaRatio(60)
      const isExpanded = expandedIndex !== null

      // Auto-Scroll Logic
      if (!isPausedRef.current && !isDragging.current && !isExpanded) {
        scrollTarget.current += AUTO_SCROLL_SPEED * dt
      }

      // Smooth scroll lerp with threshold clamping to settle microscopic decimals
      const ease = 1 - Math.pow(1 - SCROLL_LERP, dt)
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * ease
      if (Math.abs(scrollTarget.current - scrollCurrent.current) < 0.01) {
        scrollCurrent.current = scrollTarget.current
      }

      // Global Pop Lerp Clamping
      const targetGlobal = isExpanded ? 1 : 0
      globalPopRef.current += (targetGlobal - globalPopRef.current) * (POP_LERP * dt)
      if (Math.abs(globalPopRef.current - targetGlobal) < 0.001) {
        globalPopRef.current = targetGlobal
      }

      const { width: containerWidth, height: containerHeight, cx: windowCenterX, arcBaselineY, slideGap, trackWidth } = dims.current
      if (trackWidth === 0) return

      let closestDist = Infinity
      let closestIndex = -1

      cardRefs.current.forEach((el, i) => {
        if (!el) return

        let wrappedOffsetX = (((i * slideGap - scrollCurrent.current) % trackWidth) + trackWidth) % trackWidth
        if (wrappedOffsetX > trackWidth / 2) wrappedOffsetX -= trackWidth
        
        offsetsRef.current[i] = wrappedOffsetX

        const slideCenterX = windowCenterX + wrappedOffsetX
        const normalizedDist = wrappedOffsetX / (containerWidth * 0.5)
        const absDist = Math.min(Math.abs(normalizedDist), 1.5)

        if (Math.abs(wrappedOffsetX) < closestDist) {
          closestDist = Math.abs(wrappedOffsetX)
          closestIndex = i
        }

        // Individual Pop Lerp Clamping
        const targetPop = expandedIndex === i ? 1 : 0
        popValuesRef.current[i] += (targetPop - popValuesRef.current[i]) * (POP_LERP * dt)
        if (Math.abs(popValuesRef.current[i] - targetPop) < 0.001) {
          popValuesRef.current[i] = targetPop
        }
        const popVal = popValuesRef.current[i]

        const baseScale = Math.max(1 - absDist * 0.25, 0.5) 
        const translateZ = Math.abs(normalizedDist) * -200 
        const rotateY = normalizedDist * -45 
        const baseY = arcBaselineY + Math.pow(absDist, 2) * 20
        const baseOpacity = Math.max(0.1, 1 - absDist * 1.5)

        const popX = windowCenterX 
        const popY = containerHeight / 2 

        // ── CACHED SIZE CALCULATIONS ──
        let popWidth = layout.slideWidth
        let popHeight = layout.slideHeight

        if (!targetSizesRef.current[i]) {
          if (layout.isMobile) {
            const mobileScale = Math.min(
              (containerWidth * 0.9) / layout.slideWidth,
              (containerHeight * 0.9) / layout.slideHeight,
              1.4 
            )
            targetSizesRef.current[i] = { w: layout.slideWidth * mobileScale, h: layout.slideHeight * mobileScale }
          } else {
            const imgEl = imgRefs.current[i]
            if (imgEl && imgEl.naturalWidth && imgEl.naturalHeight) {
              const screenMargin = 0.9
              const fitScale = Math.min(
                (containerWidth * screenMargin) / imgEl.naturalWidth,
                (containerHeight * screenMargin) / imgEl.naturalHeight,
                1 
              )
              targetSizesRef.current[i] = { w: imgEl.naturalWidth * fitScale, h: imgEl.naturalHeight * fitScale }
            } else {
              // Not loaded yet; fallback and leave un-cached so it attempts again next frame
              popWidth = layout.slideWidth * 1.5
              popHeight = layout.slideHeight * 1.5
            }
          }
        }

        if (targetSizesRef.current[i]) {
          popWidth = targetSizesRef.current[i].w
          popHeight = targetSizesRef.current[i].h
        }

        // ── SMOOTH INTERPOLATION ──
        const currentWidth = layout.slideWidth + (popWidth - layout.slideWidth) * popVal
        const currentHeight = layout.slideHeight + (popHeight - layout.slideHeight) * popVal
        
        const currentX = slideCenterX + (popX - slideCenterX) * popVal
        const currentY = baseY + (popY - baseY) * popVal
        const currentScale = baseScale + (1 - baseScale) * popVal
        const currentTranslateZ = translateZ * (1 - popVal)
        const currentRotateY = rotateY * (1 - popVal)

        let finalOpacity = baseOpacity
        if (expandedIndex !== null && expandedIndex !== i) {
          finalOpacity = baseOpacity * (1 - globalPopRef.current * 0.8) 
        } else {
          finalOpacity = baseOpacity + (1 - baseOpacity) * popVal 
        }

        const zIndex = expandedIndex === i ? 1000 : Math.round((1 - absDist) * 100)

        // ── HIGH-PERFORMANCE DOM WRITES (DIFFING) ──
        // Limiting fraction digits cuts down string memory garbage heavily
        const wStr = `${currentWidth.toFixed(1)}px`
        const hStr = `${currentHeight.toFixed(1)}px`
        const tStr = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, ${currentTranslateZ.toFixed(2)}px) translate(-50%, -50%) rotateY(${currentRotateY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`
        const oStr = finalOpacity.toFixed(3)
        const zStr = zIndex.toString()

        const ls = lastStylesRef.current[i]

        if (ls.w !== wStr) { el.style.width = wStr; ls.w = wStr }
        if (ls.h !== hStr) { el.style.height = hStr; ls.h = hStr }
        if (ls.t !== tStr) { el.style.transform = tStr; ls.t = tStr }
        if (ls.o !== oStr) { el.style.opacity = oStr; ls.o = oStr }
        if (ls.z !== zStr) { el.style.zIndex = zStr; ls.z = zStr }
      })

      // Sync Active Title
      if (closestIndex !== activeIndexRef.current && titleRef.current) {
        activeIndexRef.current = closestIndex
        const activeItem = displayItems[closestIndex]
        
        if (activeItem.text) {
          titleRef.current.textContent = activeItem.text
          gsap.killTweensOf(titleRef.current) 
          gsap.fromTo(titleRef.current, 
            { opacity: 0, y: 15 }, 
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          )
        } else {
          titleRef.current.textContent = ''
        }
      }

      if (titleRef.current) {
        const titleOpacity = (1 - globalPopRef.current).toFixed(2)
        if (titleRef.current.style.opacity !== titleOpacity) {
          titleRef.current.style.opacity = titleOpacity
        }
      }
    }

    gsap.ticker.add(animate)
    return () => gsap.ticker.remove(animate)
  }, [displayItems, layout.isMobile, expandedIndex, layout.slideHeight, layout.slideWidth])

  // ── INTERACTION HANDLERS ──
  const handleCardClick = (index: number) => {
    if (hasDragged.current) return 
    
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
      scrollTarget.current += offsetsRef.current[index]
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (expandedIndex !== null) return 
    const normalizedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50)
    scrollTarget.current += normalizedDelta * 0.8
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (expandedIndex !== null) return 
    isDragging.current = true
    hasDragged.current = false 
    touchStartX.current = e.clientX
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || expandedIndex !== null) return
    const touchCurrentX = e.clientX
    const deltaX = touchStartX.current - touchCurrentX
    
    if (Math.abs(deltaX) > 5) {
      hasDragged.current = true
    }

    scrollTarget.current += deltaX * 1.2 
    touchStartX.current = touchCurrentX
  }

  const handlePointerUp = () => {
    isDragging.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current && expandedIndex !== null) {
      setExpandedIndex(null)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      className="relative w-full h-full cursor-grab touch-none select-none overflow-hidden"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleBackgroundClick}
    >
      {displayItems.map((item, i) => (
        <div
          key={i}
          ref={(el) => { cardRefs.current[i] = el }}
          onClick={() => handleCardClick(i)}
          className={`absolute top-0 left-0 shadow-[0_15px_30px_rgba(0,0,0,0.6)] will-change-transform rounded-2xl overflow-hidden transition-shadow duration-300 ${
            expandedIndex === i ? 'cursor-zoom-out shadow-[0_30px_60px_rgba(0,0,0,0.8)]' : 'cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpandedIndex(null)
            }}
            className={`absolute z-[2000] text-white bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 rounded-full transition-all duration-300 
              top-3 right-3 p-1.5 md:top-5 md:right-5 md:p-3
              ${expandedIndex === i ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'}
            `}
            aria-label="Close"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            ref={(el) => { imgRefs.current[i] = el }}
            src={item.image}
            alt={item.text}
            className="w-full h-full object-cover pointer-events-none rounded-2xl"
            draggable={false}
          />
        </div>
      ))}

      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <p 
          ref={titleRef}
          className="text-white font-cinzel text-xl md:text-3xl font-semibold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
        ></p>
      </div>
    </div>
  )
}