// app/success/page.tsx
import React from "react";
import { cookies } from 'next/headers'; // 👈 Necesario para Server Components
import { getClientSession } from '@/lib/cookies'; // 👈 Tu utilidad
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { urlImageProductPath } from "@/lib/pathImage";
import { FaWhatsapp } from "react-icons/fa";
import Confetti from 'react-confetti-boom';
import Conffeti from "@/components/client/Conffeti";
import Link from "next/link";
import SuccessPaymentWidgets from "@/components/client/SuccessPaymentWidgets";


// Define el tipo de los searchParams para mayor claridad
interface SuccessPageProps {
  searchParams: {
    amount: string;
    productId: string;
  };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // Nota: Dado que searchParams ya es un objeto, no necesitas React.use()
  // Usaremos destructuring directo.

  const { amount, productId } = await searchParams;

  const imageProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { image: true }
  });
  console.log("Imagen del producto comprado:", imageProduct);

  // 1. Leer la cookie del lado del servidor
  const clientId = await getClientSession({ cookies }); // Pasamos el objeto 'cookies'

  // Opcional: Podrías usar este ID para una segunda acción, como:
  // - Limpiar el carrito de compras (si estuviera en una base de datos)
  // - Mostrar un mensaje personalizado basado en el historial del cliente (aunque ya lo hace /mis-pedidos)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <main className="w-full flex min-h-screen flex-col items-center justify-center px-6 py-4 sm:max-w-5xl sm:justify-between sm:py-32 sm:px-16">
        <Conffeti/>
        <div className="w-full flex flex-col justify-center items-center text-center relative">
          <h1 className="z-30 text-8xl sm:text-8xl font-semibold text-white font-calistoga">
            Purchased!
          </h1>
        </div>
        <SuccessPaymentWidgets imageProduct={imageProduct} amount={amount} clientId={clientId || ''}/>
        
        
        
      </main>
    </div>
  );
}