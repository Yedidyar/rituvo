import type { ReactNode } from 'react'

import { useTranslation } from '#/i18n/locale-provider'

const WORDMARK = 'Becoming'

/** Two overlapping circles — light green over clay — the Becoming mark. */
function LogoMark() {
  return (
    <svg
      width="30"
      height="20"
      viewBox="0 0 30 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="10" r="9" fill="#8FBFA3" />
      <circle cx="19" cy="10" r="9" fill="#C2703E" fillOpacity="0.92" />
    </svg>
  )
}

const witnessDots = [
  { initial: 'D', className: 'left-[39%] top-[-7%] bg-[#C2703E]' },
  { initial: 'A', className: 'left-[-4%] top-[26%] bg-[#A6AFA3]' },
  { initial: 'Y', className: 'left-[92%] top-[52%] bg-[#567C86]' },
  { initial: 'N', className: 'left-[14%] top-[84%] bg-[#6B563F]' },
]

/** Dashed circle of initialed witness dots orbiting the member (decorative). */
function WitnessOrbit() {
  return (
    <div
      className="relative aspect-square w-47.5 shrink-0 rounded-full border border-dashed border-white/25 xl:w-60"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8FBFA3]" />
      {witnessDots.map((dot) => (
        <span
          key={dot.initial}
          className={`font-body absolute flex h-8.5 w-8.5 items-center justify-center rounded-full text-[13px] font-bold text-white ${dot.className}`}
        >
          {dot.initial}
        </span>
      ))}
    </div>
  )
}

/** Sample check-in reflection, quoted in the product's voice. */
function CheckInQuoteCard() {
  const { translate } = useTranslation()

  return (
    <figure className="min-w-0 flex-1 rounded-3xl border border-white/10 bg-white/5 p-7 xl:max-w-140 xl:p-8">
      <figcaption className="font-body text-[12px] font-bold uppercase tracking-[0.16em] text-[#8FBFA3]">
        {translate('auth.brandCheckInKicker')}
      </figcaption>
      <blockquote className="font-heading mt-3 text-start text-[20px] font-bold leading-[1.35] text-[#F5F1E6] xl:text-[22px]">
        {translate('auth.brandCheckInQuote')}
      </blockquote>
    </figure>
  )
}

/**
 * Host-page layout shared by sign-in and sign-up.
 *
 * Desktop (≥1024px): a full-height deep-leaf brand panel (56%, 56px padding),
 * top-aligned — wordmark, then the headline ~90px below, then subtext, with
 * the witness orbit + check-in quote pinned to the panel foot. Mobile: a
 * compact deep-leaf header block, then the form directly on cream — the Clerk
 * card sheds its chrome below `lg` (see the provider appearance) so the whole
 * page fits one viewport without scrolling. The flex row and logical
 * alignment (`text-start`) mirror automatically under `dir="rtl"`.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { translate } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col bg-(--color-cream) lg:flex-row">
      <aside className="flex flex-col rounded-b-[28px] bg-(--color-deep-leaf) px-6 py-7 lg:w-[56%] lg:rounded-none lg:p-14">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="font-heading text-[22px] font-black text-[#FAF7F1] lg:text-[24px]">
            {WORDMARK}
          </span>
        </div>
        <h1 className="font-heading mt-6 max-w-120 text-start text-[30px] font-bold leading-[1.12] text-[#FAF7F1] lg:mt-22.5 lg:text-[52px]">
          {translate('auth.brandHeadline')}
        </h1>
        <p className="font-body mt-3 max-w-105 text-start text-[15px] leading-[1.55] text-[#B9CBBE] lg:mt-4.5 lg:text-[19px]">
          {translate('auth.brandSubtext')}
          <span className="hidden lg:inline">
            {' '}
            {translate('auth.brandSubtextMore')}
          </span>
        </p>
        <div className="mt-auto hidden items-center gap-8 pt-16 lg:flex xl:gap-10">
          <WitnessOrbit />
          <CheckInQuoteCard />
        </div>
      </aside>

      <main className="flex flex-1 items-start justify-center px-6 py-6 lg:items-center lg:p-10">
        {children}
      </main>
    </div>
  )
}
