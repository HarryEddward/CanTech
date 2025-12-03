// app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { prisma } from '@/lib/prisma';
import { setClientSession } from '@/lib/cookies';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      amount, 
      currency = 'eur', 
      paymentIntentId, // Nuevo: Identificador si ya existe el intento
      email, 
      phone, 
      productId // Necesitamos saber qué producto es para crear la Order
    } = body;

    // CASO 1: Sincronización final (El usuario dio click a pagar)
    // Aquí creamos el Cliente y la Orden en Prisma
    if (paymentIntentId && email) {
      let stripeCustomerId: string | undefined;
      let client: any;

      // 1. Buscar o Crear Cliente en Stripe
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        // Actualizar teléfono si es necesario
        if (phone) await stripe.customers.update(stripeCustomerId, { phone });
      } else {
        const newCustomer = await stripe.customers.create({ email, phone });
        stripeCustomerId = newCustomer.id;
      }

      // 2. Vincular el Cliente de Stripe al PaymentIntent existente
      await stripe.paymentIntents.update(paymentIntentId, {
        customer: stripeCustomerId,
        receipt_email: email,
        metadata: {
          productId: productId // Guardamos referencia en Stripe también
        }
      });

      // 3. Lógica Prisma: Buscar o Crear Cliente
      client = await prisma.client.findFirst({
        where: { stripeCustomerId },
      });

      if (!client) {
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

      setClientSession(client.id, { cookies });

      // 4. Lógica Prisma: Crear la Orden (Si no existe ya para este paymentId)
      const existingOrder = await prisma.order.findUnique({
        where: { stripePaymentId: paymentIntentId }
      });

      if (!existingOrder && productId) {
        await prisma.order.create({
          data: {
            stripePaymentId: paymentIntentId,
            amount: amount, // Asegúrate de que coincida con el formato de tu DB
            clientId: client.id,
            productId: productId,
          }
        });
      }

      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: 1
          }
        }
      });

      return NextResponse.json({ success: true, clientId: client.id });
    }

    // CASO 2: Inicialización (Carga de página)
    // Solo creamos el intent anónimo para que Stripe Elements funcione
    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
      // No asignamos customer aún porque no lo tenemos
    });


    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id // Devolvemos el ID para usarlo luego
    });

  } catch (error) {
    console.error('Error en API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}