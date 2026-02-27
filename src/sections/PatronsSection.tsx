import ShinyText from '../components/ShinyText'
import { GlassCard } from '../components/GlassCard'

function PatronCard({
  name,
  designation,
}: {
  name: string
  designation?: string
}) {
  return (
    <GlassCard className="flex flex-col items-center justify-center px-6 py-7 text-center">
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

function SectionTitle({ text }: { text: string }) {
  return (
    <h3
      className="mb-8 text-center font-cinzel text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 drop-shadow-[0_0_15px_rgba(147,51,234,0.3)] sm:text-5xl"
    >
      <ShinyText
        text={text}
        speed={4}
        color="rgba(209,213,219,0.8)"
        shineColor="#ffffff"
        spread={120}
        yoyo
      />
    </h3>
  )
}

/* ── Section ──────────────────────────────────────────────────────────────── */

export default function PatronsSection() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
      <div className="relative z-10 mx-auto w-full max-w-7xl">

        <div className="mb-20">
          <SectionTitle text="Patrons" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Dr. B. S. Ragini Narayan" designation="Donor Trustee & Chairperson, BMSET" />
            <PatronCard name="Dr. P. Dayananda Pai" designation="Chairperson, BMSCE & Life Trustee, BMSET" />
            <PatronCard name="Shri Aviram Sharma" designation="Trustee, BMSET" />
          </div>
        </div>

        <div className="mb-20">
          <SectionTitle text="Advisory Committee" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Dr. Bheemsha Arya" designation="Principal, BMSCE" />
            <PatronCard name="Dr. Seshachalam D" designation="Vice Principal - Admin" />
            <PatronCard name="Dr. L. Ravikumar" designation="Vice Principal - Academic" />
          </div>
        </div>

        <div className="mb-20">
          <SectionTitle text="Faculty Core Committee" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Dr. Rajeshwari Hegde" designation="Working Chairman" />
            <PatronCard name="Dr. Niranjan K. R." designation="Organising Secretary" />
            <PatronCard name="Prof. Namratha M." designation="Joint Organising Secretary" />
            <PatronCard name="Prof. Chaitanya L." designation="Faculty Treasurer" />
            <PatronCard name="Dr. Chethana K. Y." designation="Department of Aerospace Engineering" />
            <PatronCard name="Dr. Kaliprasad C. S." designation="Department of Physics" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 mx-auto max-w-4xl">
            <PatronCard name="Prof. Manoj Kumar S." designation="Department of Computer Science and Data Science" />
            <PatronCard name="Dr. Soumya Lakshmi B. S." designation="Department of Machine Learning" />
          </div>
        </div>

        <div>
          <SectionTitle text="Student Core Committee" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PatronCard name="Amogh Ananda" />
            <PatronCard name="B. S. Shreevidya" />
            <PatronCard name="Chinmayi Anand" />
            <PatronCard name="G. Divyashree" />
            <PatronCard name="Sevitha N" />
            <PatronCard name="Tulasikrishna Tammina" />
          </div>
          <div className="mt-6 mx-auto max-w-sm">
            <PatronCard name="Varun Reddy" />
          </div>
        </div>

      </div>

      <div className="pointer-events-none absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-purple-900/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full bg-purple-900/10 blur-[100px]" />
    </section>
  )
}
