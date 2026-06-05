import HomePage from '@/components/HomePage'
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return <HomePage locale={locale} />
}
