// app/api/create-intent/route.js
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'eur' } = await req.json();

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Monto inválido (mínimo $0.50 USD)' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // en centavos: 1000 = $10.00
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      // metadata: { orderId: '12345' }, // opcional: vincula con tu DB
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creando PaymentIntent:', error);
    return NextResponse.json(
      { error: error || 'Error interno' },
      { status: 500 }
    );
  }
}