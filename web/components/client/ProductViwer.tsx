// components/client/ProductViwer.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import type { Product } from "@/generated/prisma/client";
import Image from 'next/image';
import { urlImageProductPath } from '@/lib/pathImage';
import { useCartStore } from '@/lib/store';

// Asegúrate de importar los iconos que planeas usar
import { FaPalette, FaRuler, FaTag, FaQuestionCircle } from 'react-icons/fa'; // Importa los iconos que necesites
import { IoIosWater } from "react-icons/io";
import { FaBatteryEmpty } from "react-icons/fa6";
import { MdTouchApp } from "react-icons/md";
import { RiBattery2ChargeFill } from "react-icons/ri";
import { FaBluetooth } from "react-icons/fa";
import { IconBaseProps } from 'react-icons';
import Link from 'next/link';
import clsx from 'clsx';

// Define la estructura de una característica
interface Characteristic {
  title: string;
  description: string;
  iconName?: string; // Nombre del icono como string
}

// Define el tipo del producto que maneja este componente
interface IProductViwer {
  className?: string;
  product: Product;
}

// Mapa que relaciona nombres de iconos (string) con componentes React
const iconMap: Record<string, React.ComponentType<IconBaseProps>> = {
  FaPalette: FaPalette,
  FaRuler: FaRuler,
  FaTag: FaTag,
  IoIosWater: IoIosWater,
  FaBatteryEmpty: FaBatteryEmpty,
  MdTouchApp: MdTouchApp,
  RiBattery2ChargeFill: RiBattery2ChargeFill,
  FaBluetooth: FaBluetooth
  // Añade más entradas según necesites
  // Si el iconName no está en el mapa, se mostrará un icono por defecto
};

export default function ProductViwer({ className = "", product }: IProductViwer) {
  const [openFeatures, setOpenFeatures] = useState<Record<number, boolean>>({});

  const { addProduct } = useCartStore();
  
  useEffect(() => {
    addProduct(product);
  }, []);
  

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
            <h3 className="w-full text-6xl  text-center text-slate-950 mb-3 font-calistoga">Características</h3>
            {
              product.characteristics && product.characteristics.length === 0 && // Verifica si es un array vacío
              <p className="text-center text-slate-600">No hay características disponibles para este producto.</p>
            }
            <div className=""> {/* Contenedor para los dropdowns */}
              {Array.isArray(product.characteristics) && product.characteristics.map((feature, i) => {

                // Busca el componente de icono correspondiente al nombre
                const IconComponent = iconMap[feature.iconName || '']; // Si iconName no existe o no está en el mapa, IconComponent será undefined
                const FallbackIcon = FaQuestionCircle; // Icono por defecto si no se encuentra el nombre

                // Sanitiza la descripción aquí

                return (
                  <div
                    key={i}
                    className={"border border-slate-400 overflow-hidden" + (i === 0 ? ' rounded-t-lg' : '') + (i === product.characteristics.length - 1 ? ' rounded-b-lg' : '')} // Bordes redondeados solo en el primer y último ítem
                  >
                    {/* Botón del dropdown */}
                    <button
                      type="button"
                      className="w-full flex justify-between items-center p-4 bg-slate-950 text-white text-left font-medium hover:bg-green-200 hover:text-green-900 transition-colors"
                      onClick={() => toggleFeature(i)}
                      aria-expanded={openFeatures[i]}
                      aria-controls={`feature-content-${i}`} // ARIA para accesibilidad
                    >
                      <span className=' text-xl flex items-center gap-2'> {/* Flexbox para icono y texto */}
                        {/* Renderiza el icono si se encuentra */}
                        {IconComponent ? <IconComponent /> : <FallbackIcon />} {/* Muestra el icono mapeado o el fallback */}
                        {feature.title}
                      </span>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          openFeatures[i] ? 'rotate-180' : '' // Rotar la flecha cuando está abierta
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Contenido del dropdown */}
                    <div
                    id={`feature-content-${i}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFeatures[i] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-3 bg-white text-slate-600 border-t border-slate-200">
                      <p className="text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  </div>
                )
              }
              )}
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