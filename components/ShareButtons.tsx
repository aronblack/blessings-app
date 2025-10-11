'use client'

import { useState, useEffect } from 'react'

interface ShareButtonsProps {
  blessing: string
}

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
      ui: (params: { method: string; href: string; quote?: string }, callback?: (response: { [key: string]: unknown; status: string }) => void) => void
    }
  }
}

export default function ShareButtons({ blessing }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [fbLoaded, setFbLoaded] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    setShareUrl(window.location.href)
    
    // Load Facebook SDK
    if (!window.FB && !document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        if (window.FB) {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_DEFAULT_APP_ID',
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          })
          setFbLoaded(true)
        }
      }
      
      document.head.appendChild(script)
    } else if (window.FB) {
      setFbLoaded(true)
    }
  }, [])

  const shareText = `Today's blessing: "${blessing}" ✨ #DailyBlessings #Blessed`
  const fullShareText = `${shareText}\n\nGet your own blessing at: ${shareUrl}`
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOnFacebook = () => {
    if (window.FB && fbLoaded) {
      // Use Facebook Share Dialog with feed method to include message
      window.FB.ui({
        method: 'feed',
        href: shareUrl,
        quote: `${shareText}`,
      }, function(response: { [key: string]: unknown; status: string }) {
        if (response && !('error_code' in response)) {
          console.log('Post was shared successfully.')
        } else {
          console.log('Error occurred while sharing.')
        }
      })
    } else {
      // Fallback - open a new post with pre-filled text
      const facebookUrl = `https://www.facebook.com/intent/post/?text=${encodeURIComponent(fullShareText)}`
      window.open(facebookUrl, '_blank', 'width=626,height=436')
    }
  }

  const shareOnTwitter = () => {
    const tweetText = `${shareText}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, 'twitter-share-dialog', 'width=626,height=436')
  }

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`
    window.open(url, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`
    window.open(url, 'linkedin-share-dialog', 'width=626,height=436')
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-600 mb-3 text-center">Share this blessing</p>
      
      <div className="flex justify-center gap-3 flex-wrap">
        {/* Facebook */}
        <button
          onClick={shareOnFacebook}
          disabled={!isClient || !shareUrl}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Share on Facebook"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        {/* Twitter/X */}
        <button
          onClick={shareOnTwitter}
          disabled={!isClient || !shareUrl}
          className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Share on Twitter/X"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </button>

        {/* WhatsApp */}
        <button
          onClick={shareOnWhatsApp}
          disabled={!isClient || !shareUrl}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Share on WhatsApp"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          WhatsApp
        </button>

        {/* LinkedIn */}
        <button
          onClick={shareOnLinkedIn}
          disabled={!isClient || !shareUrl}
          className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Share on LinkedIn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>

        {/* Copy to clipboard */}
        <button
          onClick={handleCopy}
          disabled={!isClient || !shareUrl}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Copy to clipboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      {/* Show URL only after hydration */}
      {isClient && shareUrl && (
        <div className="mt-2 text-xs text-gray-400 text-center break-all">
          URL: {shareUrl}
        </div>
      )}
    </div>
  )
}