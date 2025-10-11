import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, mobile } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // TODO: Save to your database
    // Example with a simple database:
    /*
    await db.subscribers.create({
      email,
      mobile: mobile || null,
      subscribedAt: new Date(),
      isActive: true
    })
    */

    // For now, just log it
    console.log('New subscription:', { email, mobile })

    return NextResponse.json({ 
      message: 'Successfully subscribed to daily blessings!' 
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}