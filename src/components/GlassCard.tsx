

export function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={`
        relative overflow-hidden rounded-[1.75rem]
        border border-white/10
        bg-white/[0.03]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.04),0_32px_72px_-28px_rgba(0,0,0,0.7)]
        backdrop-blur-xl
        ${className}
      `}
    >
      <div
        className="h-full w-full transition-all duration-500"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-white/15 to-transparent" />
        {children}
      </div>
    </article >
  )
}