import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCodeMeaning, getAllSpecialCodes } from '@/lib/codeMeanings'
import BlessingCardClient, { ShareLink } from '@/app/blessing/[code]/BlessingCardClient'
import { isLocale, uiText } from '@/lib/i18n'

interface Props {
  params: Promise<{ locale: string; code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, locale } = await params
  const entry = getCodeMeaning(code)

  const labels = isLocale(locale) ? uiText[locale] : uiText.en

  if (!entry) {
    return {
      title: `Code ${code} - ${labels.meaningTitleFallback}`,
      description: `Receive a personalized blessing for code ${code}.`
    }
  }

  return {
    title: `${code} - ${entry.title} | ${labels.meaningTitleFallback}`,
    description: entry.meaning.slice(0, 155),
    openGraph: {
      title: `Code ${code}: ${entry.title}`,
      description: entry.blessing,
      type: 'article'
    }
  }
}

export function generateStaticParams() {
  return getAllSpecialCodes().flatMap(c => [
    { locale: 'en', code: c.code },
    { locale: 'es', code: c.code },
    { locale: 'it', code: c.code },
    { locale: 'de', code: c.code },
    { locale: 'fr', code: c.code }
  ])
}

export default async function CodePage({ params }: Props) {
  const { code, locale } = await params

  if (!isLocale(locale)) notFound()

  if (!/^\d{4}$/.test(code)) notFound()

  const entry = getCodeMeaning(code)
  const t = uiText[locale]

  return (
    <main className='min-h-dvh py-12 px-6'>
      <div className='max-w-xl mx-auto space-y-8'>
        <Link
          href={`/${locale}`}
          className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors'
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 18 9 12 15 6' /></svg>
          {t.backToBlessings}
        </Link>

        <div className='text-center'>
          <span className='inline-block bg-gray-900 text-white text-4xl font-light tracking-widest px-6 py-3 rounded-2xl shadow-xl'>
            {code}
          </span>
          {entry && <p className='mt-3 text-xl text-gray-600 font-light'>{entry.title}</p>}
        </div>

        {entry ? (
          <>
            <section className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-7 space-y-4'>
              <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium'>{t.whatThisCodeMeans}</h2>
              <p className='text-gray-700 leading-relaxed'>{entry.meaning}</p>
            </section>

            <section className='space-y-2'>
              <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium px-1'>{t.yourBlessing}</h2>
              <BlessingCardClient blessing={entry.blessing} defaultBg={entry.cardBg} locale={locale} />
            </section>

            <section className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-7 space-y-4'>
              <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium'>{t.suggestedReflection}</h2>
              <p className='text-gray-700 leading-relaxed italic'>{entry.reflection}</p>
            </section>
          </>
        ) : (
          <section className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-7 text-center space-y-4'>
            <p className='text-gray-600'>
              Code <strong className='text-gray-900'>{code}</strong> {t.noSavedMeaning}
            </p>
            <Link
              href={`/${locale}/?code=${code}`}
              className='inline-block bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all shadow-lg text-sm font-medium'
            >
              {t.generateBlessingForCode} {code}
            </Link>
          </section>
        )}

        <section className='text-center'>
          <p className='text-sm text-gray-500 mb-3'>{t.shareThisPage}</p>
          <ShareLink code={code} locale={locale} />
        </section>

        <section className='space-y-3'>
          <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium text-center'>{t.otherSacredCodes}</h2>
          <div className='flex flex-wrap justify-center gap-2'>
            {getAllSpecialCodes()
              .filter(c => c.code !== code)
              .map(c => (
                <Link
                  key={c.code}
                  href={`/${locale}/blessing/${c.code}`}
                  className='px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm hover:shadow-md font-mono'
                >
                  {c.code}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  )
}
