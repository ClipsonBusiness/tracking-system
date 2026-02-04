import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  // Check if Stripe secret key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { 
        error: 'STRIPE_SECRET_KEY is not configured. Please add it to your Vercel environment variables.',
        details: 'Go to Vercel Dashboard → Settings → Environment Variables → Add STRIPE_SECRET_KEY'
      },
      { status: 500 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  })

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
    
    // Provide more helpful error messages for common Stripe errors
    let errorMessage = error.message || 'Failed to create checkout session'
    let errorDetails = ''
    
    if (error.type === 'StripeInvalidRequestError') {
      if (error.message?.includes('No such price')) {
        errorMessage = 'Invalid Price ID'
        errorDetails = `The price ID "${priceId}" doesn't exist in your Stripe account. Make sure you're using:
- A valid price ID from your Stripe Dashboard
- The correct mode (test vs live) - check if your STRIPE_SECRET_KEY matches the mode
- A price ID from the same Stripe account as your secret key`
      } else if (error.message?.includes('No such customer')) {
        errorMessage = 'Invalid Customer ID'
        errorDetails = 'The customer ID provided doesn\'t exist in your Stripe account.'
      } else if (error.message?.includes('Invalid API Key')) {
        errorMessage = 'Invalid Stripe API Key'
        errorDetails = 'Your STRIPE_SECRET_KEY is invalid or not configured correctly.'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails || error.message,
        type: error.type,
      },
      { status: 500 }
    )
  }
}

