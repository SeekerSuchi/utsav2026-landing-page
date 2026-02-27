import { motion } from 'framer-motion'
import ShinyText from '../components/ShinyText'
import { fadeUp } from '../components/animations'
import { GlassCard } from '../components/GlassCard'

/* ── Patron card ──────────────────────────────────────────────────────────── */

function PatronCard({
  name,
  designation,
  delay = 0,
}: {
  name: string
  designation?: string
  delay?: number
}) {
  return (
    <GlassCard delay={delay} className="flex flex-col items-center justify-center px-6 py-7 text-center">
      {/* Subtle accent glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-400/5 blur-2xl" />

      <p className="font-playfair text-lg font-semibold leading-snug text-white sm:text-xl">
        {name}
      </p>
      {designation && (
        <p className="mt-2 text-[0.8rem] leading-relaxed text-white/55 sm:text-sm">
          {designation}
        </p>
      )}
    </GlassCard>
  )
}

/* ── Section title ────────────────────────────────────────────────────────── */

function SectionTitle({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.h3
      {...fadeUp(delay)}
      className="mb-8 text-center font-cinzel text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-200 via-gray-400 to-gray-600 drop-shadow-[0_0_15px_rgba(147,51,234,0.3)] sm:text-5xl"
    >
      <ShinyText
        text={text}
        speed={4}
        color="rgba(209,213,219,0.8)"
        shineColor="#ffffff"
        spread={120}
        yoyo
      />
    </motion.h3>
  )
}

/* ── Section ──────────────────────────────────────────────────────────────── */

export default function PatronsSection() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
      <div className="relative z-10 mx-auto w-full max-w-7xl">

        {/* ── Patrons ──────────────────────────────────── */}
        <div className="mb-20">
          <SectionTitle text="Patrons" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Dr. B. S. Ragini Narayan" designation="Donor Trustee & Chairperson, BMSET" delay={0} />
            <PatronCard name="Dr. P. Dayananda Pai" designation="Chairperson, BMSCE & Life Trustee, BMSET" delay={0.06} />
            <PatronCard name="Shri Aviram Sharma" designation="Trustee, BMSET" delay={0.12} />
          </div>
        </div>

        {/* ── Advisory Committee ───────────────────────── */}
        <div className="mb-20">
          <SectionTitle text="Advisory Committee" delay={0.05} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Dr. Bheemsha Arya" designation="Principal, BMSCE" delay={0} />
            <PatronCard name="Dr. Seshachalam D" designation="Vice Principal - Admin" delay={0.06} />
            <PatronCard name="Dr. L. Ravikumar" designation="Vice Principal - Academic" delay={0.12} />
          </div>
        </div>

        {/* ── Faculty Core Committee ───────────────────── */}
        <div className="mb-20">
          <SectionTitle text="Faculty Core Committee" delay={0.05} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Dr. Rajeshwari Hegde" designation="Working Chairman" delay={0} />
            <PatronCard name="Dr. Niranjan K. R." designation="Organising Secretary" delay={0.06} />
            <PatronCard name="Prof. Namratha M." designation="Joint Organising Secretary" delay={0.12} />
            <PatronCard name="Prof. Chaitanya L." designation="Faculty Treasurer" delay={0.18} />
            <PatronCard name="Dr. Chethana K. Y." designation="Department of Aerospace Engineering" delay={0.24} />
            <PatronCard name="Dr. Kaliprasad C. S." designation="Department of Physics" delay={0.3} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 mx-auto max-w-4xl">
            <PatronCard name="Prof. Manoj Kumar S." designation="Department of Computer Science and Data Science" delay={0.36} />
            <PatronCard name="Dr. Soumya Lakshmi B. S." designation="Department of Machine Learning" delay={0.42} />
          </div>
        </div>

        {/* ── Student Core Committee ───────────────────── */}
        <div>
          <SectionTitle text="Student Core Committee" delay={0.05} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Amogh Ananda" delay={0} />
            <PatronCard name="B. S. Shreevidya" delay={0.06} />
            <PatronCard name="Chinmayi Anand" delay={0.12} />
            <PatronCard name="G. Divyashree" delay={0.18} />
            <PatronCard name="Sevitha N" delay={0.24} />
            <PatronCard name="Tulasikrishna Tammina" delay={0.3} />
          </div>
          <div className="mt-6 mx-auto max-w-sm">
            <PatronCard name="Varun Reddy" delay={0.36} />
          </div>
        </div>

      </div>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/4 right-0 h-100 w-100 rounded-full bg-purple-900/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 h-100 w-100 rounded-full bg-purple-900/10 blur-[100px]" />
    </section>
  )
}
