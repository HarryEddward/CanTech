"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/generated/prisma/client"
import { mockProducts } from "@/config/client";
import Link from "next/link";
import { urlImageProductPath } from "@/lib/pathImage";

interface IProductsCarrousel {
    products?: Product[]
}

export default function ProductsCarrousel({ products = mockProducts }: IProductsCarrousel) {
  
  const [rotation, setRotation] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  const itemsCount = products.length;
  const angleStep = 360 / itemsCount;

  const getItemStyle = (index: number) => {
    const angle = (rotation + index * angleStep) % 360;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const distanceFromFront = Math.min(Math.abs(normalizedAngle), Math.abs(normalizedAngle - 360));
    const isVisible = distanceFromFront < angleStep * 1.5;
    const isFront = distanceFromFront < angleStep / 2;
    const isLeft = normalizedAngle > 180 && normalizedAngle < 360 - angleStep / 2;
    const isRight = normalizedAngle < 180 && normalizedAngle > angleStep / 2;
    
    const scale = isFront ? 1 : 0.6;
    const opacity = isVisible ? (isFront ? 1 : 0.5) : 0;
    const zIndex = isFront ? 10 : (isVisible ? 5 : 0);
    
    let x = 0;
    if (isLeft) x = -100;
    if (isRight) x = 100;
    const y = isFront ? 0 : 50;
    
    return { x, y, scale, opacity, zIndex, isFront, isVisible };
  };

  const handleDragEnd = (event: Event, info: any) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;
    const rotationChange = (dragDistance + velocity * 0.1) / 3;
    const newRotation = rotation + rotationChange;
    const normalizedRotation = (((-newRotation % 360) + 360) % 360);
    const nearestIndex = Math.round(normalizedRotation / angleStep) % itemsCount;
    setRotation(-nearestIndex * angleStep);
  };

  const getCurrentIndex = () => {
    const normalizedRotation = (((-rotation % 360) + 360) % 360);
    return Math.round(normalizedRotation / angleStep) % itemsCount;
  };

  return (
    <>
        <motion.div 
            className="relative w-full h-[300px] flex items-center justify-center mb-14 cursor-grab active:cursor-grabbing"
            drag="x"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={(e, info) => setDragStart(info.point.x)}
            onDragEnd={handleDragEnd}
            style={{ perspective: "1000px" }}
        >
            {products.map((product, index) => {
              const style = getItemStyle(index);

              // ---------------------------------------------------------
              // LÓGICA DE ESTADO (Aquí definimos qué mostrar antes de pintar)
              // ---------------------------------------------------------
              let statusText = "";
              let topColor = "";    // Color del botón superior
              let bottomColor = ""; // Color de la barra inferior
              let canBuy = false;   // ¿Se puede hacer click?

              if (product.stock <= 0) {
                // CASO 1: NO HAY STOCK
                statusText = "Sin unidades";
                topColor = "bg-gray-400";
                bottomColor = "bg-gray-600";
                canBuy = false;
              } else if (product.stock <= 5) {
                // CASO 2: STOCK BAJO (1 a 5)
                statusText = `Últimas unidades: ${product.stock}`;
                topColor = "bg-red-300";
                bottomColor = "bg-red-900";
                canBuy = true;
              } else {
                // CASO 3: HAY STOCK (> 5)
                statusText = "Clickea para comprar";
                topColor = "bg-green-300";
                bottomColor = "bg-green-900";
                canBuy = true;
              }
              // ---------------------------------------------------------

              return (
                  <motion.div
                    key={product.id}
                    className="absolute select-none"
                    animate={{ x: style.x, y: style.y, scale: style.scale, opacity: style.opacity, zIndex: style.zIndex }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.5 }}
                  >
                  <div className={`relative ${style.isFront ? 'drop-shadow-2xl shadow-amber-50' : ''}`}>
                      <Image
                        src={urlImageProductPath(product.image)}
                        alt={product.name}
                        width={style.isFront ? 500 : 400}
                        height={style.isFront ? 500 : 400}
                        className={`select-none ${!canBuy ? 'grayscale opacity-100' : ''}`} // Gris si no hay stock
                        priority={index === 0}
                      />
                      
                      {style.isFront && (
                          <motion.div
                              initial={{ opacity: 0, y: 10, scale: 1 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileTap={{ scale: canBuy ? 0.9 : 1 }}
                              className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                          >
                              <div className="w-full flex flex-col items-center justify-center">
                              
                                {/* PARTE SUPERIOR (NOMBRE DEL PRODUCTO) */}
                                <div className={`w-full text-5xl font-semibold text-white font-calistoga p-4 rounded-t-2xl ${topColor}`}>
                                  {canBuy ? (
                                    // Si hay stock, ponemos el Link
                                    <Link href={`/payment?productId=${product.id}`}>
                                      {product.name}
                                    </Link>
                                  ) : (
                                    // Si NO hay stock, solo texto (sin Link)
                                    <span className="cursor-not-allowed">{product.name}</span>
                                  )}
                                </div>
                                
                                {/* PARTE INFERIOR (MENSAJE DE ESTADO) */}
                                <span className={`w-full rounded-b-2xl p-3 text-white text-center font-bold ${bottomColor}`}>
                                  {statusText}
                                </span>

                              </div>
                          </motion.div>
                      )}
                  </div>
                  </motion.div>
              );
            })}
        </motion.div>

        {/* Indicadores */}
        <div className="flex gap-4 mt-20">
            {products.map((_, index) => (
            <button
                key={index}
                onClick={() => setRotation(-index * angleStep)}
                className={`h-2 rounded-full transition-all pointer-events-none ${
                index === getCurrentIndex() ? "w-8 bg-white" : "w-2 bg-white hover:bg-white"
                }`}
            />
            ))}
        </div>
    </>
  );
}