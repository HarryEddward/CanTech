// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { stripePaymentId, amount, email, productId } = await req.json();

    // Buscar cliente por email
    const client = await prisma.client.findFirst({
      where: { email },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Crear el pedido
    const order = await prisma.order.create({
      data: {
        stripePaymentId,
        amount,
        clientId: client.id,
        productId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creando pedido:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}