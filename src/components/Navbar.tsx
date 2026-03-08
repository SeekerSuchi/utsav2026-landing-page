import { useState, useEffect } from 'react'

interface NavbarProps {
  isVisible: boolean; // Waits for the App.tsx intro to finish
}

export default function Navbar({ isVisible }: NavbarProps) {
  // New state to track if the user is scrolling up or down
  const [isScrollingUp, setIsScrollingUp] = useState(true)

  useEffect(() => {
    // Keep track of the last scroll position locally to compare against
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // If scrolling DOWN and past a small 80px buffer (so it doesn't hide at the very top)
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsScrollingUp(false)
      } 
      // If scrolling UP
      else if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true)
      }

      // Update the tracker for the next scroll event
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // The navbar should only show IF the intro is done AND the user is scrolling up
  const shouldShow = isVisible && isScrollingUp

  return (
    <nav
      style={{
        position: 'fixed',
        top: '1.25rem', 
        left: '50%',
        // Use our new combined "shouldShow" variable here
        transform: `translateX(-50%) translateY(${shouldShow ? '0' : '-150%'})`,
        opacity: shouldShow ? 1 : 0,
        // Sped up the transition slightly (0.4s) so it feels responsive when scrolling
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
        zIndex: 100,
        
        width: 'min(92vw, 1000px)', 
        height: 'clamp(60px, 6vw, 80px)', 
        borderRadius: '9999px',
        
        background: 'rgba(20, 10, 30, 0.65)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', 
        padding: '0 1.25rem',
        pointerEvents: shouldShow ? 'auto' : 'none',
      }}
    >
      {/* Left Side: Logo */}
      <img 
        src="/u26 final logo.png" 
        alt="Utsav Logo" 
        style={{
          height: 'clamp(45px, 5vw, 65px)', 
          width: 'auto',
          objectFit: 'contain',
          userSelect: 'none',
          cursor: 'pointer',
          marginLeft: '-0.5rem' 
        }}
        draggable={false}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
      />

      {/* Right Side: Events Link */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <a
          href="#events"
          style={{
            color: '#e2d8f0',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
            padding: '0.5rem 1rem', 
            background: 'transparent', 
            borderRadius: '999px',
            border: '1px solid transparent'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#FF9FFC';
            e.currentTarget.style.background = 'rgba(222, 91, 234, 0.1)'; 
            e.currentTarget.style.border = '1px solid rgba(255, 159, 252, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#e2d8f0';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.border = '1px solid transparent';
          }}
        >
          Events
        </a>
      </div>
    </nav>
  )
}