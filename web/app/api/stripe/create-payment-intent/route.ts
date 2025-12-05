// app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { prisma } from '@/lib/prisma';
import { setClientSession } from '@/lib/cookies';
import { cookies } from 'next/headers';

// 1. IMPORTANTE: Importamos el tipo 'Client' desde tu ruta generada
import type { Client } from '@/generated/prisma/client'; 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      amount, 
      currency = 'eur', 
      paymentIntentId, 
      email, 
      phone, 
      productId 
    } = body;

    // CASO 1: Sincronización final
    if (paymentIntentId && email) {
      let stripeCustomerId: string | undefined;

      // 2. CORRECCIÓN: Definimos la variable con el tipo de Prisma o null
      let client: Client | null = null; 

      // --- 1. Buscar o Crear Cliente en Stripe ---
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        if (phone) await stripe.customers.update(stripeCustomerId, { phone });
      } else {
        const newCustomer = await stripe.customers.create({ email, phone });
        stripeCustomerId = newCustomer.id;
      }

      // --- 2. Vincular el Cliente de Stripe al PaymentIntent ---
      await stripe.paymentIntents.update(paymentIntentId, {
        customer: stripeCustomerId,
        receipt_email: email,
        metadata: { productId: productId }
      });

      // --- 3. Lógica Prisma: Buscar o Crear Cliente ---
      client = await prisma.client.findFirst({
        where: { stripeCustomerId },
      });

      if (!client) {
        // Al crearlo, 'client' deja de ser null y pasa a ser tipo Client
        client = await prisma.client.create({
          data: {
            email,
            phone,
            stripeCustomerId,
            discount: 10,
            used: false,
          },
        });
      }

      // TypeScript ahora sabe que client no es null aquí gracias al flujo anterior
      // Pasamos { cookies } tal cual lo requiere cookies-next en Server Actions/Routes
      setClientSession(client.id, { cookies });

      // --- 4. Lógica Prisma: Crear la Orden ---
      const existingOrder = await prisma.order.findUnique({
        where: { stripePaymentId: paymentIntentId }
      });

      if (!existingOrder && productId) {
        await prisma.order.create({
          data: {
            stripePaymentId: paymentIntentId,
            amount: amount,
            clientId: client.id,
            productId: productId,
          }
        });

        // Movi el update de stock AQUÍ DENTRO.
        // Seguridad: Solo descontamos stock si se crea la orden y existe productId
        await prisma.product.update({
            where: { id: productId },
            data: {
              stock: { decrement: 1 }
            }
        });
      }

      return NextResponse.json({ success: true, clientId: client.id });
    }

    // CASO 2: Inicialización
    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error en API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
