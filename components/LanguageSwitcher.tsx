'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { localeNames, locales, type Locale } from '@/lib/i18n'

interface Props {
  currentLocale: Locale
  label: string
}

function toLocalePath(pathname: string, targetLocale: Locale) {
  const parts = pathname.split('/').filter(Boolean)
  const withoutLocale = locales.includes(parts[0] as Locale) ? parts.slice(1) : parts
  return `/${targetLocale}${withoutLocale.length ? `/${withoutLocale.join('/')}` : ''}`
}

export default function LanguageSwitcher({ currentLocale, label }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()

  return (
    <div className='flex items-center gap-2 text-xs sm:text-sm bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-2 shadow-sm'>
      <span className='text-gray-500'>{label}</span>
      {locales.map(locale => {
        const hrefBase = toLocalePath(pathname, locale)
        const href = query ? `${hrefBase}?${query}` : hrefBase
        const selected = locale === currentLocale
        return (
          <Link
            key={locale}
            href={href}
            className={`px-2 py-1 rounded-full transition-colors ${
              selected ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {localeNames[locale]}
          </Link>
        )
      })}
    </div>
  )
}
