export interface CodeMeaning {
  code: string
  title: string
  meaning: string
  blessing: string
  reflection: string
  cardBg: string
}

const codeMeanings: Record<string, CodeMeaning> = {
  '7777': {
    code: '7777',
    title: 'Abundance & Fortune',
    meaning:
      'The code 7777 carries the energy of amplified luck and divine alignment. In numerology, 7 is the number of spiritual wisdom, inner knowing, and good fortune. Four sevens in sequence signal that the universe is fully supporting your path.',
    blessing:
      'May abundance find you in unexpected ways. May every door that is meant for you open with ease.',
    reflection:
      'Where in your life have you been holding back from receiving? Today, practice opening your hands — let go of scarcity thinking and notice what is already flowing toward you.',
    cardBg: '/sacred-geometry.png',
  },
  '4444': {
    code: '4444',
    title: 'Protection & Stability',
    meaning:
      '4444 is an angel number of deep protection and groundedness. The number 4 represents foundations, home, and the steady presence of guides watching over you. Repeated four times, it is an unmistakable signal that you are not alone.',
    blessing:
      'May you feel protected, grounded, and steady. May peace surround your home and your heart.',
    reflection:
      'What foundations in your life deserve gratitude today? Take a moment to acknowledge the stability you have built — the people, the habits, the values that hold you up.',
    cardBg: '/forest.png',
  },
  '1212': {
    code: '1212',
    title: 'New Beginnings',
    meaning:
      '1212 blends the pioneering energy of 1 with the partnership energy of 2. Together they form a doorway — an invitation to step forward into something new while trusting the process. This code often appears at threshold moments.',
    blessing:
      'May this be a season of new beginnings. May courage rise in you exactly when you need it.',
    reflection:
      'What new beginning are you standing on the edge of? Write down one small, brave step you could take today — not tomorrow, today.',
    cardBg: '/heaven1.png',
  },
  '1111': {
    code: '1111',
    title: 'Manifestation Portal',
    meaning:
      '1111 is one of the most recognized manifestation codes. It marks a moment when your thoughts have direct creative power. Many traditions see it as a portal — a reminder to align your mind with what you truly want to call in.',
    blessing:
      'May your intentions be clear and your heart be bold. May this moment be the seed of something beautiful.',
    reflection:
      'What thought were you holding when you encountered this code? That thought is a clue. Is it a worry to release, or a dream to nurture?',
    cardBg: '/nightscape.png',
  },
  '2222': {
    code: '2222',
    title: 'Balance & Trust',
    meaning:
      '2222 asks you to trust the timing of your life. The energy of 2 is about patience, faith, and harmony. Four twos together say: you are exactly where you need to be, even if it does not feel that way yet.',
    blessing:
      'May patience become your superpower. May trust replace your doubt, one breath at a time.',
    reflection:
      'Where are you rushing something that needs time? Sit with that area of your life for a few minutes today without trying to fix it. Simply breathe and trust.',
    cardBg: '/ocean.png',
  },
  '3333': {
    code: '3333',
    title: 'Creativity & Expression',
    meaning:
      '3333 is the code of the creator. The number 3 governs self-expression, joy, and the voice of the soul. Four threes invite you to stop dimming your light and let your creativity, humor, and truth flow freely.',
    blessing:
      'May your voice carry light. May your creativity be both your gift and your joy.',
    reflection:
      'When did you last do something purely for the joy of making it? Set aside 15 minutes today for creative play — no purpose, no audience, just you.',
    cardBg: '/sacred-geometry.png',
  },
  '5555': {
    code: '5555',
    title: 'Change & Freedom',
    meaning:
      '5555 heralds significant change. The number 5 is the energy of transformation, adventure, and liberation. Four fives signal that a major shift is either arriving or long overdue — and that it is ultimately for your growth.',
    blessing:
      'May change arrive as a gift, not a loss. May you move through transitions with grace and openness.',
    reflection:
      'What change have you been resisting? Consider that the resistance itself might be telling you something important. What would you do if you were not afraid?',
    cardBg: '/forest.png',
  },
  '6666': {
    code: '6666',
    title: 'Rebalancing & Healing',
    meaning:
      '6666 is often misunderstood. In numerology, 6 is the number of care, responsibility, and healing — the energy of the nurturer. Four sixes invite you to rebalance: are you giving too much and not receiving enough?',
    blessing:
      'May healing find every corner of your heart. May you receive care as graciously as you give it.',
    reflection:
      'How have you been caring for yourself lately? Identify one way you have been neglecting your own needs and commit to addressing it today.',
    cardBg: '/heaven1.png',
  },
  '8888': {
    code: '8888',
    title: 'Infinite Flow',
    meaning:
      '8888 carries the vibration of infinite abundance and karmic balance. The number 8, shaped like infinity, represents cycles completing and prosperity flowing. Four eights signal that a season of harvest is near.',
    blessing:
      'May everything you have invested in — your time, your love, your effort — return to you multiplied.',
    reflection:
      'What cycle in your life is coming to completion? Take a moment to honor how far you have come before you step into the next chapter.',
    cardBg: '/sacred-geometry.png',
  },
  '9999': {
    code: '9999',
    title: 'Completion & Release',
    meaning:
      '9999 marks the end of a cycle. The number 9 is the energy of completion, compassion, and wisdom earned through experience. Four nines are a powerful invitation to release what is finished and make space for what comes next.',
    blessing:
      'May you release with grace what is no longer yours to carry. May endings become doorways.',
    reflection:
      'What are you holding on to that is already complete — a relationship, an identity, a chapter? Write it down, thank it, and let it go.',
    cardBg: '/nightscape.png',
  },
  '0000': {
    code: '0000',
    title: 'The Void & Pure Potential',
    meaning:
      '0000 is the code of pure potential. Zero is the origin — before beginning, before form. Four zeros represent the infinite field from which all things emerge. This is a moment of stillness before a new cycle.',
    blessing:
      'May you find stillness in the space between. May pure potential be your companion today.',
    reflection:
      'Spend two minutes in silence today. No phone, no task, no music. Simply be. Notice what arises in the quiet.',
    cardBg: '/black-white.png',
  },
}

export function getCodeMeaning(code: string): CodeMeaning | null {
  return codeMeanings[code] ?? null
}

export function getAllSpecialCodes(): CodeMeaning[] {
  return Object.values(codeMeanings)
}

export default codeMeanings
