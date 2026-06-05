import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, getPreferredLocale, isLocale } from '@/lib/i18n'

const PUBLIC_FILE = /\.(.*)$/

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const segment = pathname.split('/')[1]
  if (segment && isLocale(segment)) {
    return NextResponse.next()
  }

  const detected = getPreferredLocale(request.headers.get('accept-language')) || defaultLocale
  const url = request.nextUrl.clone()
  url.pathname = `/${detected}${pathname}`
  url.search = search
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)']
}
