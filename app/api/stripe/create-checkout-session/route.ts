import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      priceId,
      customerId,
      affiliateCode,
      successUrl,
      cancelUrl,
    } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      )
    }

    // Build metadata object
    const metadata: Record<string, string> = {}
    if (affiliateCode) {
      metadata.affiliate_code = affiliateCode
    }

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${APP_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${APP_BASE_URL}/cancel`,
      metadata,
      subscription_data: {
        metadata,
      },
    }

    // If customer exists, attach metadata to customer
    if (customerId) {
      sessionParams.customer = customerId
      // Update customer metadata if affiliate code provided
      if (affiliateCode) {
        try {
          await stripe.customers.update(customerId, {
            metadata: {
              affiliate_code: affiliateCode,
            },
          })
        } catch (err) {
          console.error('Error updating customer metadata:', err)
          // Continue anyway
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

