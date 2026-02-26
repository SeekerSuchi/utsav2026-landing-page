import { motion } from 'framer-motion'
import ShinyText from '../components/ShinyText'
import { fadeUp } from '../components/animations'

/* Inline SVG icon components — eliminates react-icons dependency */
const FacebookIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.092.034 1.543.084v3.213c-.168-.018-.46-.027-.824-.027-1.17 0-1.623.443-1.623 1.596v2.692h2.327l-.4 3.667h-1.927v7.98h-4.954z"/></svg>
)
const InstagramIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
)
const XTwitterIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
)
const YoutubeIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
)

const socials = [
  { Icon: FacebookIcon, href: 'https://m.facebook.com/utsavbmsce', label: 'Facebook' },
  { Icon: InstagramIcon, href: 'https://www.instagram.com/bmsce_utsav/', label: 'Instagram' },
  { Icon: XTwitterIcon, href: 'https://twitter.com/bmsce_utsav', label: 'X / Twitter' },
  { Icon: YoutubeIcon, href: 'https://www.youtube.com/@BMSCE_UTSAV', label: 'YouTube' },
]

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative flex flex-col items-center justify-center px-4 py-20 sm:py-28"
    >
      {/* Title */}
      <motion.h2
        {...fadeUp(0)}
        className="mb-2 text-center font-cinzel text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-200 via-gray-400 to-gray-600 drop-shadow-[0_0_15px_rgba(147,51,234,0.4)] sm:text-6xl md:text-7xl"
      >
        <ShinyText
          text="Get In Touch"
          speed={4}
          color="rgba(209,213,219,0.8)"
          shineColor="#ffffff"
          spread={120}
          yoyo
        />
      </motion.h2>

      {/* Social icons */}
      <motion.div {...fadeUp(0.1)} className="mt-10 flex gap-6">
        {socials.map((social, idx) => (
          <a
            key={idx}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="group relative"
          >
            <div className="absolute inset-0 rounded-full bg-purple-500 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/3 text-gray-400 backdrop-blur-md transition-all duration-300 group-hover:border-purple-500/50 group-hover:text-white md:h-16 md:w-16">
              <social.Icon size={28} />
            </div>
          </a>
        ))}
      </motion.div>

      {/* Address glass panel */}
      <motion.div
        {...fadeUp(0.2)}
        className="mt-12 w-full rounded-3xl border border-gray-500/20 bg-white/2 p-8 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 hover:border-purple-500/30 md:w-1/2"
      >
        <p className="text-lg font-light leading-relaxed text-gray-300 md:text-xl">
          <span className="font-semibold text-gray-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            B. M. S. College of Engineering
          </span>
          <br />
          <span className="text-base text-gray-400 md:text-lg">
            #1908, Bull Temple Road, Basavanagudi, Bangalore - 560029
          </span>
          <br />
          <a
            href="mailto:utsav@bmsce.ac.in"
            className="mt-2 inline-block font-medium text-purple-400 transition-colors hover:text-purple-300"
          >
            utsav@bmsce.ac.in
          </a>
        </p>
      </motion.div>
    </section>
  )
}
