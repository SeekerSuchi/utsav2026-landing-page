import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.9) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: '1.25rem', // Slightly closer to the top for mobile
        left: '50%',
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '-150%'})`,
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 100,
        
        // Sizing: Reduced max-width since we only have one link
        width: 'min(92vw, 1000px)', 
        height: 'clamp(60px, 6vw, 80px)', // Slimmer for mobile screens
        borderRadius: '9999px',
        
        // Glassmorphism
        background: 'rgba(20, 10, 30, 0.65)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        
        // Layout
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', 
        padding: '0 1.25rem', // Tighter padding for smaller screens
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Left Side: Logo */}
      <img 
        src="/u26 final logo.png" // Replace with your exact new file name if it changed
        alt="Utsav Trayana Logo" 
        style={{
          // 1. Made it much bigger (scaling from 45px on mobile to 65px on laptop)
          height: 'clamp(45px, 5vw, 65px)', 
          width: 'auto',
          objectFit: 'contain',
          userSelect: 'none',
          cursor: 'pointer',
          // 2. Pulls the logo to the left to counter the empty space in the SVG file
          marginLeft: '-0.5rem' 
        }}
        draggable={false}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
      />

      {/* Right Side: Only the Events Link */}
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
            // Button-like styling for better mobile tap targeting
            padding: '0.5rem 1rem', 
            background: 'transparent', 
            borderRadius: '999px',
            border: '1px solid transparent'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#FF9FFC';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.border = '1px solid rgba(255, 159, 252, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#e2d8f0';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)';
          }}
        >
          Events
        </a>
      </div>
    </nav>
  )
}