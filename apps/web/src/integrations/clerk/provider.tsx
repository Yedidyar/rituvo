import { ClerkProvider } from '@clerk/tanstack-react-start'
import { heIL } from '@clerk/localizations'

import type { Locale } from '#/i18n/config'
import { useLocale } from '#/i18n/locale-provider'

// Shared appearance so sign-in, sign-up, and the user button match the
// Becoming design system. Clerk injects its own (unlayered) styles that beat
// Tailwind utilities in the cascade, so the shape/size/colour rules that must
// win use Tailwind's `!` important modifier.
const appearance = {
  // Force full-width stacked "Continue with …" buttons (not the compact
  // side-by-side icon buttons Clerk auto-picks for 2+ providers), with the
  // social row above the email field.
  layout: {
    socialButtonsVariant: 'blockButton' as const,
    socialButtonsPlacement: 'top' as const,
  },
  variables: {
    colorPrimary: '#2F6B4F',
    colorBackground: '#FFFFFF',
    colorText: '#22302A',
    colorTextSecondary: '#66756C',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#22302A',
    borderRadius: '16px',
    fontFamily: 'Assistant, sans-serif',
  },
  elements: {
    // Mobile (<lg) dissolves the card entirely — controls sit directly on the
    // cream page so sign-in/sign-up fit one viewport without scrolling. The
    // start step's title/subtitle are hidden in styles.css; the brand header
    // above already titles the page.
    rootBox: 'max-lg:w-full!',
    cardBox:
      'max-lg:w-full! max-lg:rounded-none! max-lg:border-0! max-lg:bg-transparent! max-lg:shadow-none!',
    // Card: 420px wide, 36px padding, 24px radius, hairline border + soft shadow.
    card: 'w-[420px]! max-w-full! rounded-[24px]! border! border-[#E9E2D3]! bg-white! p-9! shadow-[0_16px_44px_rgba(31,42,36,0.08)]! max-lg:w-full! max-lg:rounded-none! max-lg:border-0! max-lg:bg-transparent! max-lg:p-0! max-lg:shadow-none!',
    // Title/subtitle left-aligned (logical start, so RTL flips it).
    header: 'items-start! text-start!',
    headerTitle:
      'font-[Frank_Ruhl_Libre]! text-start! text-[26px]! font-bold! text-[#22302A]!',
    headerSubtitle: 'text-start! text-[15px]! text-[#66756C]!',
    // Social buttons: full-width stack; shared shape on the base key, colours
    // only on the per-provider keys. Two `!` utilities on one element
    // (bg-white! vs bg-[#22302A]!) tie on specificity and resolve by
    // stylesheet order, so the base key must never set a colour a provider
    // key needs to override. `order-*` puts Google before Apple regardless of
    // the instance's connection order.
    socialButtons: 'flex! w-full! flex-col! items-stretch! gap-2!',
    socialButtonsBlockButton: 'h-[52px]! w-full! rounded-full! font-bold!',
    socialButtonsBlockButton__google:
      'order-1! border-[1.5px]! border-[#D8CFBB]! bg-white! hover:bg-[#FAF7F1]!',
    // Apple: dark ink pill, white label, black logo whitened.
    socialButtonsBlockButton__apple:
      'order-2! border-[1.5px]! border-[#22302A]! bg-[#22302A]! text-white! hover:border-[#0F1713]! hover:bg-[#0F1713]!',
    socialButtonsBlockButtonText: 'font-bold!',
    socialButtonsBlockButtonText__apple: 'text-white!',
    socialButtonsProviderIcon__apple: 'brightness-0! invert!',
    dividerLine: 'bg-[#E9E2D3]!',
    dividerText: 'text-[#9AA69E]!',
    // Input: rounded rectangle (16px), 52px tall, leaf focus ring.
    formFieldLabel: 'text-start! text-[13px]! font-bold! text-[#4A5850]!',
    formFieldInput:
      'h-[52px]! rounded-[16px]! border-[1.5px]! border-[#D8CFBB]! bg-white! focus:border-[#2F6B4F]! focus:shadow-[0_0_0_3px_#EAF1EC]!',
    // Primary: full pill, leaf fill, centered label, no arrow (hidden in CSS).
    formButtonPrimary:
      'h-[52px]! justify-center! rounded-full! bg-[#2F6B4F]! text-[16px]! font-bold! normal-case! text-white! shadow-none! hover:bg-[#27593F]!',
    // Footer sits in the card flow on white — drop the grey strip.
    footer: 'bg-transparent!',
    footerActionLink: 'font-bold! text-[#2F6B4F]! hover:text-[#1E3D2D]!',
  },
}

// With two or more providers in view Clerk swaps the block-button label to
// the bare provider name ("Google", "Apple"); keep the full wording. Typed per
// locale so adding a language fails to compile until its label is supplied.
const continueWithProviderLabel: Record<Locale, string> = {
  en: 'Continue with {{provider|titleize}}',
  he: 'המשך עם {{provider|titleize}}',
}

// Clerk ships a full localization pack per language; English is its built-in
// default and needs none. Map each locale to its pack here — adding a language
// is one import plus one entry, and the merge in the component stays untouched.
const clerkBaseLocalization: Partial<Record<Locale, typeof heIL>> = {
  he: heIL,
}

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { locale, translate } = useLocale()

  // Warm, coach-like card copy; the email placeholder is blanked (the "Email"
  // label above is enough).
  const cardCopy = {
    signIn: {
      start: {
        title: translate('auth.signInTitle'),
        subtitle: translate('auth.signInSubtitle'),
      },
    },
    signUp: {
      start: {
        title: translate('auth.signUpTitle'),
        subtitle: translate('auth.signUpSubtitle'),
      },
    },
  }
  const placeholders = {
    formFieldInputPlaceholder__emailAddress: '',
    formFieldInputPlaceholder__identifier: '',
  }
  const socialButtonLabels = {
    socialButtonsBlockButtonManyInView: continueWithProviderLabel[locale],
  }

  const base = clerkBaseLocalization[locale]
  const localization = {
    ...base,
    ...placeholders,
    ...socialButtonLabels,
    signIn: {
      ...base?.signIn,
      start: { ...base?.signIn?.start, ...cardCopy.signIn.start },
    },
    signUp: {
      ...base?.signUp,
      start: { ...base?.signUp?.start, ...cardCopy.signUp.start },
    },
  }

  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={appearance}
      localization={localization}
    >
      {children}
    </ClerkProvider>
  )
}
