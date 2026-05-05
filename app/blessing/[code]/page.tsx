import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCodeMeaning, getAllSpecialCodes } from '@/lib/codeMeanings'
import BlessingCardClient, { ShareLink } from './BlessingCardClient'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const entry = getCodeMeaning(code)

  if (!entry) {
    return {
      title: `Code ${code} — Daily Blessings`,
      description: `Receive a personalized blessing for code ${code}.`,
    }
  }

  return {
    title: `${code} — ${entry.title} | Daily Blessings`,
    description: entry.meaning.slice(0, 155),
    openGraph: {
      title: `Code ${code}: ${entry.title}`,
      description: entry.blessing,
      type: 'article',
    },
  }
}

export function generateStaticParams() {
  return getAllSpecialCodes().map(c => ({ code: c.code }))
}

export default async function CodePage({ params }: Props) {
  const { code } = await params

  // Validate: must be exactly 4 digits
  if (!/^\d{4}$/.test(code)) notFound()

  const entry = getCodeMeaning(code)

  return (
    <main className='min-h-dvh py-12 px-6'>
      <div className='max-w-xl mx-auto space-y-8'>

        {/* Back */}
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors'
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 18 9 12 15 6'/></svg>
          Back to blessings
        </Link>

        {/* Code badge */}
        <div className='text-center'>
          <span className='inline-block bg-gray-900 text-white text-4xl font-light tracking-widest px-6 py-3 rounded-2xl shadow-xl'>
            {code}
          </span>
          {entry && (
            <p className='mt-3 text-xl text-gray-600 font-light'>{entry.title}</p>
          )}
        </div>

        {/* Meaning */}
        {entry ? (
          <>
            <section className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-7 space-y-4'>
              <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium'>What this code means</h2>
              <p className='text-gray-700 leading-relaxed'>{entry.meaning}</p>
            </section>

            {/* Blessing card */}
            <section className='space-y-2'>
              <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium px-1'>Your blessing</h2>
              <BlessingCardClient blessing={entry.blessing} defaultBg={entry.cardBg} />
            </section>

            {/* Reflection */}
            <section className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-7 space-y-4'>
              <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium'>Suggested reflection</h2>
              <p className='text-gray-700 leading-relaxed italic'>{entry.reflection}</p>
            </section>
          </>
        ) : (
          /* Unknown code — offer to generate */
          <section className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-7 text-center space-y-4'>
            <p className='text-gray-600'>
              Code <strong className='text-gray-900'>{code}</strong> doesn&apos;t have a saved meaning yet.
            </p>
            <Link
              href={`/?code=${code}`}
              className='inline-block bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all shadow-lg text-sm font-medium'
            >
              Generate a blessing for {code}
            </Link>
          </section>
        )}

        {/* Share link */}
        <section className='text-center'>
          <p className='text-sm text-gray-500 mb-3'>Share this page</p>
          <ShareLink code={code} />
        </section>

        {/* Explore other codes */}
        <section className='space-y-3'>
          <h2 className='text-xs uppercase tracking-widest text-gray-400 font-medium text-center'>Other sacred codes</h2>
          <div className='flex flex-wrap justify-center gap-2'>
            {getAllSpecialCodes()
              .filter(c => c.code !== code)
              .map(c => (
                <Link
                  key={c.code}
                  href={`/blessing/${c.code}`}
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
