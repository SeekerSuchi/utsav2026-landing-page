import { motion } from 'framer-motion'

/* ── Liquid-glass card wrapper ────────────────────────────────────────────── */

export function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.article
      className={`
        relative overflow-hidden rounded-[1.75rem]
        border border-white/10
        bg-white/3
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.04),0_32px_72px_-28px_rgba(0,0,0,0.7)]
        backdrop-blur-xl
        ${className}
      `}
    >
      {/* highlights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-white/15 to-transparent" />
      {children}
    </motion.article>
  )
}