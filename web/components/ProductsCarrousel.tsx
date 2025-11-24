
"use client";
import { useState } from "react";
import Image from "next/image";
import { animate, motion } from "framer-motion";




export interface Product {
    id: number;
    image: string;
    name: string;

}

const defaultProducts: Product[] = [
    { id: 1, image: "/images/ipods.png", name: "iPods" },
    { id: 2, image: "/images/headphone.png", name: "Headphones" },
    { id: 3, image: "/images/ipods.png", name: "iPods Pro" },
    { id: 4, image: "/images/headphone.png", name: "Headphones Max" },
    { id: 5, image: "/images/ipods.png", name: "iPods Mini" }
];

interface IProductsCarrousel {
    products?: Product[]
}

export default function ProductsCarrousel({ products = defaultProducts }: IProductsCarrousel) {
  

  const [rotation, setRotation] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  const itemsCount = products.length;
  const angleStep = 360 / itemsCount;

  const getItemStyle = (index: number) => {
    const angle = (rotation + index * angleStep) % 360;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // El item está al frente cuando el ángulo está cerca de 0
    const distanceFromFront = Math.min(
      Math.abs(normalizedAngle),
      Math.abs(normalizedAngle - 360)
    );
    
    // Solo mostrar el item frontal y los dos laterales
    const isVisible = distanceFromFront < angleStep * 1.5;
    
    // Determinar posición: centro, izquierda o derecha
    const isFront = distanceFromFront < angleStep / 2;
    const isLeft = normalizedAngle > 180 && normalizedAngle < 360 - angleStep / 2;
    const isRight = normalizedAngle < 180 && normalizedAngle > angleStep / 2;
    
    // Calcular escala y opacidad
    const scale = isFront ? 1 : 0.6;
    const opacity = isVisible ? (isFront ? 1 : 0.5) : 0;
    const zIndex = isFront ? 10 : (isVisible ? 5 : 0);
    
    // Posición en el eje X
    let x = 0;
    if (isLeft) x = -100;
    if (isRight) x = 100;
    
    const y = isFront ? 0 : 50;
    
    return {
      x,
      y,
      scale,
      opacity,
      zIndex,
      isFront,
      isVisible
    };
  };



  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }, velocity: { x: number } }
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;
    
    // Calcular cuántos items rotar basado en el drag
    const rotationChange = (dragDistance + velocity * 0.1) / 3;
    const newRotation = rotation + rotationChange;
    
    // Encontrar el producto más cercano y ajustar a él
    const normalizedRotation = (((-newRotation % 360) + 360) % 360);
    const nearestIndex = Math.round(normalizedRotation / angleStep) % itemsCount;
    const snappedRotation = -nearestIndex * angleStep;
    
    setRotation(snappedRotation);
  };

  const getCurrentIndex = () => {
    const normalizedRotation = (((-rotation % 360) + 360) % 360);
    return Math.round(normalizedRotation / angleStep) % itemsCount;
  };


  return (
    <>
        {/* Carrusel circular */}
        <motion.div 
            className="relative w-full h-[450px] flex items-center justify-center mb-12 cursor-grab active:cursor-grabbing"
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
            
            return (
                <motion.div
                key={product.id}
                className="absolute select-none"
                
                animate={{
                    x: style.x,
                    y: style.y,
                    scale: style.scale,
                    opacity: style.opacity,
                    zIndex: style.zIndex
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    mass: 0.5,
                    
                }}
                >
                <div className={`relative ${style.isFront ? 'drop-shadow-2xl' : ''}`}>
                    <Image
                    src={product.image}
                    alt={product.name}
                    width={style.isFront ? 500 : 400}
                    height={style.isFront ? 500 : 400}
                    className=" select-none"
                    priority={index === 0}
                    />
                    {style.isFront && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 1 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                        <motion.div
                        className="w-full flex flex-col items-center justify-center">
                        <motion.button
                        className="w-full text-5xl font-semibold text-white font-calistoga bg-green-300 p-4 rounded-t-2xl"
                        >
                            {product.name}
                        </motion.button>
                        
                        <span className=" w-full bg-green-900 rounded-b-2xl p-3">Clickear para comprar</span>
                        </motion.div>
                        
                    </motion.div>
                    )}
                </div>
                </motion.div>
            );
            })}
        </motion.div>

        {/* Indicadores */}
        <div className="flex gap-2 mb-8">
            {products.map((_, index) => (
            <button
                key={index}
                onClick={() => {
                const targetRotation = -index * angleStep;
                setRotation(targetRotation);
                }}
                className={`h-2 rounded-full transition-all ${
                index === getCurrentIndex() 
                    ? "w-8 bg-white" 
                    : "w-2 bg-white hover:bg-white"
                }`}
            />
            ))}
        </div>

        
    </>
  );
}