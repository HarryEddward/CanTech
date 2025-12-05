
import ProductsCarrousel from "@/components/client/ProductsCarrousel";
import { WiStars } from "react-icons/wi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { prisma } from '@/lib/prisma';
//import { mockProducts } from "@/config/client";
import { FaBoxOpen, FaRegEye, FaTruck } from "react-icons/fa";
import { IoIosPerson } from "react-icons/io";
import { GiMagnifyingGlass } from "react-icons/gi";
import { getClientSession } from "@/lib/cookies";
import { cookies } from "next/headers";
import Link from "next/link";
import posthog from "@/lib/posthog/server";

interface SuccessPageProps {
  searchParams: {
    access?: string;
  };
}

export async function trackLanding(access: string) {
  try {
    posthog.capture({
      distinctId: access + "-" + crypto.randomUUID(),
      event: "landing_page",
      properties: { access }
    });
    
    // Garantiza envío de los eventos en server
    await posthog.flush();
  } catch (err) {
    console.error("PostHog error:", err);
  }
}




export default async function Home({ searchParams }: SuccessPageProps) {

  const { access } = await searchParams;
  const pageAccess = access?.toLowerCase().trim() ?? "";

  console.log(pageAccess);

  //await trackLanding(pageAccess);

  const clientId = await getClientSession({ cookies });

  console.log("Client ID en Home Page:", clientId);

  const products = await prisma.product.findMany();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <main className="w-full flex min-h-screen flex-col items-center justify-center sm:max-w-5xl sm:justify-between">
        
        <div className="w-full relative flex justify-end">
          {clientId && (
            <div className="absolute p-4 pl-8 pb-8 bg-white rounded-bl-full">
              <Link href="/orders">
              <FaTruck className=" text-2xl text-slate-800" size={40}/>
              </Link>

            </div>
          )}
        </div>

        {/* Título */}
        <div className="w-full flex flex-col justify-center items-center text-center mt-10">
          <h1 className="text-9xl sm:text-7xl md:text-8xl font-calistoga font-semibold 
                        text-white leading-tight drop-shadow-lg drop-shadow-white]
                        animate-fade-in">
            Ca&apos;n Tech
          </h1>
          <p className=" text-xl text-white font-serif animate-fade-in-delay">
            Enviament&apos;s exclusius a Pollença ✨
          </p>
        </div>


        <ProductsCarrousel products={products}/>

        <div className="text-slate-950 w-full border-t-2 border-slate-400 py-4 mt-28 flex flex-col gap-y-4">
          <h3 className="text-5xl font-calistoga text-white text-center my-8">¿Porque nosotros?</h3>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-6 space-y-6 md:space-y-0 px-4">
            <div className="flex flex-row items-center justify-start gap-x-8 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 w-full md:w-1/3 text-center shadow-lg">
              
              <FaBoxOpen className=" text-6xl"/>
              <h4 className="text-4xl font-calistoga ">Caja de calidad</h4>
              
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-6 space-y-6 md:space-y-0 px-4">
            <div className="flex flex-row items-center justify-start gap-x-8 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 w-full md:w-1/3 text-center shadow-lg">
              
              <IoIosPerson className=" text-6xl"/>
              <h4 className="text-4xl font-calistoga ">Presentación personalizada</h4>
              
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-6 space-y-6 md:space-y-0 px-4">
            <div className="flex flex-row items-center justify-start gap-x-8 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 w-full md:w-1/3 text-center shadow-lg">
              
              <WiStars className=" text-6xl"/>
              <h4 className="text-4xl font-calistoga ">Atención a los detalles</h4>
              
            </div>
          </div>


          <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-6 space-y-6 md:space-y-0 px-4">
            <div className="flex flex-row items-center justify-start gap-x-8 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 w-full md:w-1/3 text-center shadow-lg">
              
              <FaRegEye className=" text-6xl"/>
              <h4 className="text-4xl font-calistoga ">Productos selectivos</h4>
              
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}