declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string
        cookie: boolean
        xfbml: boolean
        version: string
      }) => void
      ui: (
        params: {
          method: string
          href: string
          quote?: string
        },
        callback?: (response: any) => void
      ) => void
    }
  }
}

export {}