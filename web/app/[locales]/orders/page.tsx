
import ProductsCarrousel from "@/components/client/ProductsCarrousel";
import { WiStars } from "react-icons/wi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { prisma } from '@/lib/prisma';
import { mockProducts } from "@/config/client";
import { FaBoxOpen, FaRegEye, FaTruck } from "react-icons/fa";
import { IoIosPerson } from "react-icons/io";
import { GiMagnifyingGlass } from "react-icons/gi";
import { getClientSession } from "@/lib/cookies";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { urlImageProductPath } from '@/lib/pathImage';
import clsx from "clsx";



function statusTraductor(status: string) {
  switch(status) {
    case "PENDING":
      return "Pendiente";
    case "DELIVERED":
      return "Entregado";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
}

function statusTagColor(status: string) {
  switch(status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default async function Home() {

  const clientId = await getClientSession({ cookies });

  console.log("Client ID en Home Page:", clientId);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    where: { clientId: clientId },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      product: {
        select: { name: true, image: true }
      }
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <main className="w-full flex min-h-screen flex-col items-center justify-start sm:max-w-5xl sm:justify-between p-2">
        

        {/* Título */}
        <div className="w-full flex flex-col justify-center items-center text-center mt-10">
          <Link href="/" className="">
            <h1 className="text-9xl sm:text-7xl md:text-8xl font-calistoga font-semibold 
                          text-white leading-tight drop-shadow-lg drop-shadow-white]
                          animate-fade-in">
              Pedidos
            </h1>
          </Link>
        </div>


        <div className="h-full w-full bg-white rounded-md">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-2xl">
              No has realizado ningún pedido aún.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-evenly items-center">
                    <Image
                      src={urlImageProductPath(order.product.image)}
                      alt={order.product.name}
                      width={500}
                      height={500}
                      className="w-20 h-20 object-cover rounded-md scale-150"
                    />
                    <div>
                      <p className="text-lg font-medium text-gray-900">{order.product.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {(order.amount / 100).toFixed(2)}€</p>
                      <p className="text-sm text-gray-500">Estado:
                        <span className={clsx(statusTagColor(order.status))}>{statusTraductor(order.status)}</span>
                      </p>
                      <p className="text-sm text-gray-500">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                    
                </li>
              ))}
            </ul>
          )}
        </div>

        
        
      </main>
    </div>
  );
}