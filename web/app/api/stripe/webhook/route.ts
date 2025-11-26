// app/api/webhook/route.js
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

// ⚠️ Necesario para leer raw body (Stripe requiere verificación de firma)
export const runtime = 'edge'; // opcional, pero recomendado

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Falta firma o secreto' }, { status: 400 });
  }

  let event;

  try {
    // Leer body como buffer (no JSON)
    const body = await req.text(); // o `await buffer(req)` si usas Node.js runtime
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err}`);
    return NextResponse.json({ error: err }, { status: 400 });
  }

  // ✅ Manejar eventos
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Pago exitoso:', paymentIntent.id);
      // Aquí: enviar email, activar suscripción, actualizar DB, etc.
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.log('❌ Pago fallido:', failedIntent.id);
      break;

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}