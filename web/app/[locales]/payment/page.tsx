// app/payment/page.tsx
import PaymentView from "@/components/client/PaymentView";
import ProductViwer from "@/components/client/ProductViwer";
import { urlImageProductPath } from "@/lib/pathImage";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { FaArrowDown } from "react-icons/fa";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { productId?: string };
}) {
  const { productId } = await searchParams;

  if (!productId) {
    return <div className="text-center text-white mt-20">Producto no encontrado.</div>;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return <div className="text-center text-white mt-20">Producto no encontrado.</div>;
  }

  return (
    // Contenedor principal con scroll snap
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-slate-950">
      <main className="max-w-3xl mx-auto">
        {/* Sección 1: Título + Producto (snap point) */}
        <section className="min-h-screen snap-start flex flex-col justify-center py-8">
          <Link href="/" className="">
            <div className="text-center mb-8">
              <h1 className="text-8xl sm:text-5xl md:text-6xl font-calistoga font-bold text-white drop-shadow-lg">
                {product.name}
              </h1>
            </div>
          </Link>

          <ProductViwer product={product} />

          <div className="w-full flex justify-center my-24">
            <div className="p-8 rounded-full animate-bounce">
              <FaArrowDown className="text-white" size={20}/>
            </div>
          </div>
        </section>

        {/* Sección 2: Pago (snap point) */}
        <section className="bg-white snap-start">
          <PaymentView product={product}/>
        </section>
      </main>
    </div>
  );
}