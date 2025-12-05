"use client";

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
// Asegúrate de que esta ruta es correcta según tu estructura
import type { Product } from "@/generated/prisma/client"; 
import Image from 'next/image';
import { urlImageProductPath } from '@/lib/pathImage';
import { useCartStore } from '@/lib/store';

import { FaPalette, FaRuler, FaTag, FaQuestionCircle } from 'react-icons/fa';
import { IoIosWater } from "react-icons/io";
import { FaBatteryEmpty } from "react-icons/fa6";
import { MdTouchApp } from "react-icons/md";
import { RiBattery2ChargeFill } from "react-icons/ri";
import { FaBluetooth } from "react-icons/fa";
import { IconBaseProps } from 'react-icons';
import Link from 'next/link';
import clsx from 'clsx';

// 1. Definimos la estructura exacta de tus características
interface Characteristic {
  title: string;
  description: string;
  iconName?: string;
}

interface IProductViwer {
  className?: string;
  product: Product;
}

const iconMap: Record<string, React.ComponentType<IconBaseProps>> = {
  FaPalette: FaPalette,
  FaRuler: FaRuler,
  FaTag: FaTag,
  IoIosWater: IoIosWater,
  FaBatteryEmpty: FaBatteryEmpty,
  MdTouchApp: MdTouchApp,
  RiBattery2ChargeFill: RiBattery2ChargeFill,
  FaBluetooth: FaBluetooth
};

export default function ProductViwer({ className = "", product }: IProductViwer) {
  const [openFeatures, setOpenFeatures] = useState<Record<number, boolean>>({});
  const { addProduct } = useCartStore();

  useEffect(() => {
    // Cuidado aquí: Esto añadirá el producto al carrito CADA VEZ que se monte el componente.
    // Si es intencional, perfecto. Si no, revísalo.
    addProduct(product);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------------------
  // LA SOLUCIÓN:
  // Convertimos el JSON de Prisma a tu tipo Characteristic[]
  // Usamos 'as unknown as Characteristic[]' para forzar el tipado.
  // Añadimos '|| []' por si el campo viene null de la base de datos.
  // -----------------------------------------------------------------------
  const features: Characteristic[] = (Array.isArray(product.characteristics) 
    ? product.characteristics 
    : []) as unknown as Characteristic[];

  const toggleFeature = (index: number) => {
    setOpenFeatures(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className={clsx("w-full max-w-3xl mx-auto px-4", className)}>
      <motion.div
        className="z-10 relative w-full overflow-hidden rounded-xl mb-4 bg-radial from-[#8ae6ff2c] from-40% to-transparent via-slate-950 via-80%"
        initial={{ opacity: 0, scale: 0, y: 150 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileTap={{ scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 0.5,
        }}
      >
        {/* Validamos que product.image exista para evitar errores de Next/Image */}
        {product.image && (
          <Link href="/" className="">
            <Image
              src={urlImageProductPath(product.image)}
              alt={product.name}
              className="scale-100"
              priority
              width={500}
              height={500}
            />
          </Link>
        )}
      </motion.div>

      <motion.div
        className="w-full bg-white rounded-2xl p-4 shadow-lg"
        initial={{ opacity: 0.5, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 0.5,
          delay: 0.75,
        }}
      >
        <div className="">
          <div className="mb-6 text-wrap">
            <h3 className="w-full text-6xl text-center text-slate-950 mb-3 font-calistoga">Características</h3>

            {/* AHORA USAMOS LA VARIABLE 'features' QUE YA TIENE EL TIPADO CORRECTO */}
            
            {features.length === 0 && (
              <p className="text-center text-slate-600">No hay características disponibles para este producto.</p>
            )}

            <div className=""> 
              {features.map((feature, i) => {
                const IconComponent = iconMap[feature.iconName || '']; 
                const FallbackIcon = FaQuestionCircle; 

                return (
                  <div
                    key={i}
                    className={"border border-slate-400 overflow-hidden" + (i === 0 ? ' rounded-t-lg' : '') + (i === features.length - 1 ? ' rounded-b-lg' : '')}
                  >
                    <button
                      type="button"
                      className="w-full flex justify-between items-center p-4 bg-slate-950 text-white text-left font-medium hover:bg-green-200 hover:text-green-900 transition-colors"
                      onClick={() => toggleFeature(i)}
                      aria-expanded={openFeatures[i]}
                      aria-controls={`feature-content-${i}`}
                    >
                      <span className='text-xl flex items-center gap-2'> 
                        {IconComponent ? <IconComponent /> : <FallbackIcon />}
                        {/* TypeScript ahora sabe que feature.title existe */}
                        {feature.title}
                      </span>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          openFeatures[i] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <div
                      id={`feature-content-${i}`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openFeatures[i] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-3 bg-white text-slate-600 border-t border-slate-200">
                        <p className="text-base leading-relaxed">
                           {/* TypeScript ahora sabe que feature.description existe */}
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {product.description && (
                <p className="p-4 text-slate-700 mb-6 text-lg font-regular font-serif leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
