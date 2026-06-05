import { redirect } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n'

interface Props {
  params: Promise<{ code: string }>
}

export default async function LegacyBlessingPage({ params }: Props) {
  const { code } = await params
  redirect(`/${defaultLocale}/blessing/${code}`)
}
