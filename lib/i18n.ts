export const supportedLocales = ['en', 'es', 'it', 'de', 'fr'] as const

export type Locale = (typeof supportedLocales)[number]

export const locales = supportedLocales

export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (supportedLocales as readonly string[]).includes(value)
}

const languageByLocale: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  de: 'German',
  fr: 'French'
}

export function getLanguageName(locale: Locale): string {
  return languageByLocale[locale]
}

export function getPreferredLocale(acceptLanguageHeader: string | null): Locale {
  if (!acceptLanguageHeader) return defaultLocale

  const preferred = acceptLanguageHeader
    .split(',')
    .map(part => part.trim().split(';')[0]?.toLowerCase() ?? '')

  for (const item of preferred) {
    const direct = item.slice(0, 2)
    if (isLocale(direct)) return direct
  }

  return defaultLocale
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Espanol',
  it: 'Italiano',
  de: 'Deutsch',
  fr: 'Francais'
}

export function resolveLocale(input?: string | null): Locale {
  if (!input) return 'en'
  const lower = input.toLowerCase()
  const direct = supportedLocales.find(locale => locale === lower)
  if (direct) return direct

  const base = lower.split('-')[0]
  const fromBase = supportedLocales.find(locale => locale === base)
  return fromBase || 'en'
}

type UiText = {
  categoryAriaLabel: string
  categoryPlaceholder: string
  codePlaceholder: string
  codeValidationError: string
  receiveBlessing: string
  receivingBlessing: string
  todaysBlessing: string
  genericError: string
  subscribedTitle: string
  subscribedBody: string
  wantDailyBlessings: string
  gatesAlt: string
  languageLabel: string
  backToBlessings: string
  whatThisCodeMeans: string
  yourBlessing: string
  suggestedReflection: string
  unknownCode: string
  generateBlessingForCode: string
  shareThisPage: string
  otherSacredCodes: string
  meaningTitleFallback: string
  noSavedMeaning: string
  copyLink: string
  linkCopied: string
}

export const uiText: Record<Locale, UiText> = {
  en: {
    categoryAriaLabel: 'Choose blessing category',
    categoryPlaceholder: 'Choose a blessing type (optional)',
    codePlaceholder: 'Enter 4-digit code',
    codeValidationError: 'Please enter exactly 4 digits.',
    receiveBlessing: 'Receive Blessing',
    receivingBlessing: 'Receiving Blessing...',
    todaysBlessing: "Today's Blessing",
    genericError: 'Something went wrong',
    subscribedTitle: 'Subscribed to daily blessings!',
    subscribedBody: "You'll receive a blessing every day.",
    wantDailyBlessings: 'Want daily blessings? Subscribe here',
    gatesAlt: 'Gates',
    languageLabel: 'Language',
    backToBlessings: 'Back to blessings',
    whatThisCodeMeans: 'What this code means',
    yourBlessing: 'Your blessing',
    suggestedReflection: 'Suggested reflection',
    unknownCode: "doesn't have a saved meaning yet.",
    generateBlessingForCode: 'Generate a blessing for',
    shareThisPage: 'Share this page',
    otherSacredCodes: 'Other sacred codes',
    meaningTitleFallback: 'Daily Blessings',
    noSavedMeaning: "doesn't have a saved meaning yet.",
    copyLink: 'Copy link to',
    linkCopied: 'Link copied!'
  },
  es: {
    categoryAriaLabel: 'Elige una categoria de bendicion',
    categoryPlaceholder: 'Elige un tipo de bendicion (opcional)',
    codePlaceholder: 'Ingresa un codigo de 4 digitos',
    codeValidationError: 'Ingresa exactamente 4 digitos.',
    receiveBlessing: 'Recibir bendicion',
    receivingBlessing: 'Recibiendo bendicion...',
    todaysBlessing: 'Bendicion de hoy',
    genericError: 'Algo salio mal',
    subscribedTitle: 'Suscrito a bendiciones diarias!',
    subscribedBody: 'Recibiras una bendicion cada dia.',
    wantDailyBlessings: 'Quieres bendiciones diarias? Suscribete aqui',
    gatesAlt: 'Puertas',
    languageLabel: 'Idioma',
    backToBlessings: 'Volver a bendiciones',
    whatThisCodeMeans: 'Que significa este codigo',
    yourBlessing: 'Tu bendicion',
    suggestedReflection: 'Reflexion sugerida',
    unknownCode: 'todavia no tiene un significado guardado.',
    generateBlessingForCode: 'Generar bendicion para',
    shareThisPage: 'Compartir esta pagina',
    otherSacredCodes: 'Otros codigos sagrados',
    meaningTitleFallback: 'Bendiciones Diarias',
    noSavedMeaning: 'todavia no tiene un significado guardado.',
    copyLink: 'Copiar enlace a',
    linkCopied: 'Enlace copiado!'
  },
  it: {
    categoryAriaLabel: 'Scegli una categoria di benedizione',
    categoryPlaceholder: 'Scegli un tipo di benedizione (opzionale)',
    codePlaceholder: 'Inserisci codice a 4 cifre',
    codeValidationError: 'Inserisci esattamente 4 cifre.',
    receiveBlessing: 'Ricevi benedizione',
    receivingBlessing: 'Ricezione benedizione...',
    todaysBlessing: 'Benedizione di oggi',
    genericError: 'Qualcosa e andato storto',
    subscribedTitle: 'Iscritto alle benedizioni giornaliere!',
    subscribedBody: 'Riceverai una benedizione ogni giorno.',
    wantDailyBlessings: 'Vuoi benedizioni giornaliere? Iscriviti qui',
    gatesAlt: 'Porte',
    languageLabel: 'Lingua',
    backToBlessings: 'Torna alle benedizioni',
    whatThisCodeMeans: 'Cosa significa questo codice',
    yourBlessing: 'La tua benedizione',
    suggestedReflection: 'Riflessione suggerita',
    unknownCode: 'non ha ancora un significato salvato.',
    generateBlessingForCode: 'Genera una benedizione per',
    shareThisPage: 'Condividi questa pagina',
    otherSacredCodes: 'Altri codici sacri',
    meaningTitleFallback: 'Benedizioni Quotidiane',
    noSavedMeaning: 'non ha ancora un significato salvato.',
    copyLink: 'Copia link a',
    linkCopied: 'Link copiato!'
  },
  de: {
    categoryAriaLabel: 'Wahle eine Segenskategorie',
    categoryPlaceholder: 'Wahle eine Art von Segen (optional)',
    codePlaceholder: '4-stelligen Code eingeben',
    codeValidationError: 'Bitte genau 4 Ziffern eingeben.',
    receiveBlessing: 'Segen erhalten',
    receivingBlessing: 'Segen wird empfangen...',
    todaysBlessing: 'Heutiger Segen',
    genericError: 'Etwas ist schiefgelaufen',
    subscribedTitle: 'Fur tagliche Segnungen angemeldet!',
    subscribedBody: 'Du erhaltst jeden Tag einen Segen.',
    wantDailyBlessings: 'Tagliche Segnungen? Hier abonnieren',
    gatesAlt: 'Tore',
    languageLabel: 'Sprache',
    backToBlessings: 'Zuruck zu Segnungen',
    whatThisCodeMeans: 'Was dieser Code bedeutet',
    yourBlessing: 'Dein Segen',
    suggestedReflection: 'Vorgeschlagene Reflexion',
    unknownCode: 'hat noch keine gespeicherte Bedeutung.',
    generateBlessingForCode: 'Segen generieren fur',
    shareThisPage: 'Diese Seite teilen',
    otherSacredCodes: 'Weitere heilige Codes',
    meaningTitleFallback: 'Tagliche Segnungen',
    noSavedMeaning: 'hat noch keine gespeicherte Bedeutung.',
    copyLink: 'Link kopieren zu',
    linkCopied: 'Link kopiert!'
  },
  fr: {
    categoryAriaLabel: 'Choisissez une categorie de benediction',
    categoryPlaceholder: 'Choisissez un type de benediction (optionnel)',
    codePlaceholder: 'Entrez un code a 4 chiffres',
    codeValidationError: 'Veuillez entrer exactement 4 chiffres.',
    receiveBlessing: 'Recevoir la benediction',
    receivingBlessing: 'Reception de la benediction...',
    todaysBlessing: 'Benediction du jour',
    genericError: 'Un probleme est survenu',
    subscribedTitle: 'Abonne aux benedictions quotidiennes!',
    subscribedBody: 'Vous recevrez une benediction chaque jour.',
    wantDailyBlessings: 'Envie de benedictions quotidiennes? Abonnez-vous ici',
    gatesAlt: 'Portes',
    languageLabel: 'Langue',
    backToBlessings: 'Retour aux benedictions',
    whatThisCodeMeans: 'Ce que signifie ce code',
    yourBlessing: 'Votre benediction',
    suggestedReflection: 'Reflexion suggeree',
    unknownCode: "n'a pas encore de signification enregistree.",
    generateBlessingForCode: 'Generer une benediction pour',
    shareThisPage: 'Partager cette page',
    otherSacredCodes: 'Autres codes sacres',
    meaningTitleFallback: 'Benedictions Quotidiennes',
    noSavedMeaning: "n'a pas encore de signification enregistree.",
    copyLink: 'Copier le lien vers',
    linkCopied: 'Lien copie!'
  }
}

type SubscriptionText = {
  title: string
  emailPlaceholder: string
  mobilePlaceholder: string
  subscribe: string
  subscribing: string
  subscribeFailed: string
}

export const subscriptionText: Record<Locale, SubscriptionText> = {
  en: {
    title: 'Receive Daily Blessings',
    emailPlaceholder: 'Your email address',
    mobilePlaceholder: 'Your mobile number (optional)',
    subscribe: 'Subscribe to Daily Blessings',
    subscribing: 'Subscribing...',
    subscribeFailed: 'Failed to subscribe'
  },
  es: {
    title: 'Recibe bendiciones diarias',
    emailPlaceholder: 'Tu correo electronico',
    mobilePlaceholder: 'Tu numero movil (opcional)',
    subscribe: 'Suscribirme a bendiciones diarias',
    subscribing: 'Suscribiendo...',
    subscribeFailed: 'No se pudo suscribir'
  },
  it: {
    title: 'Ricevi benedizioni giornaliere',
    emailPlaceholder: 'La tua email',
    mobilePlaceholder: 'Il tuo numero di cellulare (opzionale)',
    subscribe: 'Iscriviti alle benedizioni giornaliere',
    subscribing: 'Iscrizione in corso...',
    subscribeFailed: 'Impossibile iscriversi'
  },
  de: {
    title: 'Erhalte tagliche Segnungen',
    emailPlaceholder: 'Deine E-Mail-Adresse',
    mobilePlaceholder: 'Deine Handynummer (optional)',
    subscribe: 'Tagliche Segnungen abonnieren',
    subscribing: 'Wird abonniert...',
    subscribeFailed: 'Abonnement fehlgeschlagen'
  },
  fr: {
    title: 'Recevez des benedictions quotidiennes',
    emailPlaceholder: 'Votre adresse e-mail',
    mobilePlaceholder: 'Votre numero de mobile (optionnel)',
    subscribe: 'S abonner aux benedictions quotidiennes',
    subscribing: 'Abonnement en cours...',
    subscribeFailed: "Echec de l'abonnement"
  }
}

type ShareText = {
  blessingPrefix: string
  webShareTitle: string
  copyFailed: string
  shareThisBlessing: string
  copyBlessingAria: string
  copy: string
  copied: string
  sendToFriend: string
  sendToFriendAria: string
  downloadImage: string
  downloadImageAria: string
  saved: string
  orShareOn: string
  fbCancelledLog: string
}

export const shareText: Record<Locale, ShareText> = {
  en: {
    blessingPrefix: "Today's blessing",
    webShareTitle: 'A Blessing for You',
    copyFailed: 'Failed to copy:',
    shareThisBlessing: 'Share this blessing',
    copyBlessingAria: 'Copy blessing',
    copy: 'Copy',
    copied: 'Copied!',
    sendToFriend: 'Send to a friend',
    sendToFriendAria: 'Send to a friend',
    downloadImage: 'Download image',
    downloadImageAria: 'Download as image',
    saved: 'Saved!',
    orShareOn: 'or share on',
    fbCancelledLog: 'Facebook share cancelled.'
  },
  es: {
    blessingPrefix: 'Bendicion de hoy',
    webShareTitle: 'Una bendicion para ti',
    copyFailed: 'Error al copiar:',
    shareThisBlessing: 'Comparte esta bendicion',
    copyBlessingAria: 'Copiar bendicion',
    copy: 'Copiar',
    copied: 'Copiado!',
    sendToFriend: 'Enviar a un amigo',
    sendToFriendAria: 'Enviar a un amigo',
    downloadImage: 'Descargar imagen',
    downloadImageAria: 'Descargar como imagen',
    saved: 'Guardado!',
    orShareOn: 'o compartir en',
    fbCancelledLog: 'Se cancelo el compartir en Facebook.'
  },
  it: {
    blessingPrefix: 'Benedizione di oggi',
    webShareTitle: 'Una benedizione per te',
    copyFailed: 'Copia non riuscita:',
    shareThisBlessing: 'Condividi questa benedizione',
    copyBlessingAria: 'Copia benedizione',
    copy: 'Copia',
    copied: 'Copiato!',
    sendToFriend: 'Invia a un amico',
    sendToFriendAria: 'Invia a un amico',
    downloadImage: 'Scarica immagine',
    downloadImageAria: 'Scarica come immagine',
    saved: 'Salvato!',
    orShareOn: 'o condividi su',
    fbCancelledLog: 'Condivisione Facebook annullata.'
  },
  de: {
    blessingPrefix: 'Heutiger Segen',
    webShareTitle: 'Ein Segen fur dich',
    copyFailed: 'Kopieren fehlgeschlagen:',
    shareThisBlessing: 'Diesen Segen teilen',
    copyBlessingAria: 'Segen kopieren',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    sendToFriend: 'An einen Freund senden',
    sendToFriendAria: 'An einen Freund senden',
    downloadImage: 'Bild herunterladen',
    downloadImageAria: 'Als Bild herunterladen',
    saved: 'Gespeichert!',
    orShareOn: 'oder teilen auf',
    fbCancelledLog: 'Facebook-Teilen abgebrochen.'
  },
  fr: {
    blessingPrefix: 'Benediction du jour',
    webShareTitle: 'Une benediction pour vous',
    copyFailed: 'Echec de copie :',
    shareThisBlessing: 'Partager cette benediction',
    copyBlessingAria: 'Copier la benediction',
    copy: 'Copier',
    copied: 'Copie!',
    sendToFriend: 'Envoyer a un ami',
    sendToFriendAria: 'Envoyer a un ami',
    downloadImage: 'Telecharger l image',
    downloadImageAria: 'Telecharger en image',
    saved: 'Enregistre!',
    orShareOn: 'ou partager sur',
    fbCancelledLog: 'Partage Facebook annule.'
  }
}

const categoryLabels = {
  love: { en: 'Love', es: 'Amor', it: 'Amore', de: 'Liebe', fr: 'Amour' },
  family: { en: 'Family', es: 'Familia', it: 'Famiglia', de: 'Familie', fr: 'Famille' },
  healing: { en: 'Healing', es: 'Sanacion', it: 'Guarigione', de: 'Heilung', fr: 'Guerison' },
  protection: { en: 'Protection', es: 'Proteccion', it: 'Protezione', de: 'Schutz', fr: 'Protection' },
  work: { en: 'Work', es: 'Trabajo', it: 'Lavoro', de: 'Arbeit', fr: 'Travail' },
  courage: { en: 'Courage', es: 'Valor', it: 'Coraggio', de: 'Mut', fr: 'Courage' },
  money: { en: 'Money', es: 'Dinero', it: 'Denaro', de: 'Geld', fr: 'Argent' },
  'new beginning': { en: 'New beginning', es: 'Nuevo comienzo', it: 'Nuovo inizio', de: 'Neuanfang', fr: 'Nouveau depart' },
  'grief / comfort': { en: 'Grief / comfort', es: 'Duelo / consuelo', it: 'Lutto / conforto', de: 'Trauer / Trost', fr: 'Deuil / reconfort' },
  gratitude: { en: 'Gratitude', es: 'Gratitud', it: 'Gratitudine', de: 'Dankbarkeit', fr: 'Gratitude' }
} as const

type BlessingCategoryValue = keyof typeof categoryLabels

export function getLocalizedBlessingCategories(locale: Locale) {
  return (Object.keys(categoryLabels) as BlessingCategoryValue[]).map(value => ({
    value,
    label: categoryLabels[value][locale]
  }))
}

const backgroundLabels = {
  heaven: { en: 'Heaven', es: 'Cielo', it: 'Cielo', de: 'Himmel', fr: 'Ciel' },
  forest: { en: 'Forest', es: 'Bosque', it: 'Foresta', de: 'Wald', fr: 'Foret' },
  ocean: { en: 'Ocean', es: 'Oceano', it: 'Oceano', de: 'Ozean', fr: 'Ocean' },
  stars: { en: 'Stars', es: 'Estrellas', it: 'Stelle', de: 'Sterne', fr: 'Etoiles' },
  hell: { en: 'Hellscape', es: 'Inframundo', it: 'Infernale', de: 'Hoellenlandschaft', fr: 'Paysage infernal' },
  sacred: { en: 'Sacred', es: 'Sagrado', it: 'Sacro', de: 'Heilig', fr: 'Sacre' },
  minimal: { en: 'Minimal', es: 'Minimal', it: 'Minimal', de: 'Minimal', fr: 'Minimal' }
} as const

export function getLocalizedCardBackgrounds(locale: Locale) {
  return [
    { id: 'heaven', src: '/heaven1.png' },
    { id: 'forest', src: '/forest.png' },
    { id: 'ocean', src: '/ocean.png' },
    { id: 'stars', src: '/nightscape.png' },
    { id: 'hell', src: '/hell-bkgrnd.png' },
    { id: 'sacred', src: '/sacred-geometry.png' },
    { id: 'minimal', src: '/black-white.png' }
  ].map(item => ({
    ...item,
    label: backgroundLabels[item.id as keyof typeof backgroundLabels][locale]
  }))
}