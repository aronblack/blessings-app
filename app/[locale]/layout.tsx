import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { isLocale, type Locale, uiText } from '@/lib/i18n'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    return {}
  }

  const t = uiText[locale]

  return {
    title: `${t.meaningTitleFallback} - ${t.receiveBlessing}`,
    description: 'Receive personalized daily blessings to inspire and uplift your spirit.'
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = uiText[locale as Locale]

  return (
    <div className='relative'>
      <div className='absolute top-4 right-4 z-50'>
        <Suspense fallback={null}>
          <LanguageSwitcher currentLocale={locale as Locale} label={t.languageLabel} />
        </Suspense>
      </div>
      {children}
    </div>
  )
}
