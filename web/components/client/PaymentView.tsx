// components/client/PaymentView.tsx
"use client";
import React, { useState } from 'react'
import clsx from 'clsx';
import CheckoutSheet from './CheckoutSheet';
import { Product } from '@/generated/prisma/client';
import CountrySelector from './CountrySelector';
import { SelectMenuOption } from '@/types';
import { COUNTRIES } from '@/lib/countries';
import { motion } from 'framer-motion'; // Importa motion

interface Characteristic {
  title: string;
  description: string;
  iconName?: string;
}

interface IPaymentView {
    className?: string;
    product: Product[];
};

export default function PaymentView({ className = "", product }: IPaymentView) {
  const [isOpen, setIsOpen] = useState(false);
  const [country, setCountry] = useState<SelectMenuOption["value"]>("ES");
  const finalPrice = (product?.price * 1.21).toFixed(2);

  return (
    // Reemplaza el div principal con motion.div

    <motion.div
      className={clsx("w-full min-h-screen max-w-3xl mx-auto px-4 space-y-4 bg-slate-950 py-8", className)}
      // Define el efecto whileInView
      whileInView={{ scale: 0.95, borderRadius: 20 }} // Escala a 1 cuando entra en vista
      initial={{ scale: 1, borderRadius: 0  }} // Escala inicial fuera de vista
      viewport={{ once: false }} // Opcional: ajusta el margen de detección y permite repetir la animación
      transition={{
        duration: 0.5,
        delay: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.5,
       }} // Opcional: ajusta la duración y la curva de la animación
    >
        <h2 className="text-6xl font-calistoga text-white mb-4">Precio final</h2>
        <div className='border-2 border-slate-600'>
          <div className="p-4 flex justify-between items-center">
            <span className="text-white text-lg">{product.name}:</span>
            <span className="text-white text-lg font-semibold">{product.price.toFixed(2)}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-white text-lg">Impuestos:</span>
            <span className="text-white text-lg font-semibold">21%</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-white text-lg">Transporte:</span>
            <div className="text-white text-lg font-semibold space-x-2 text-right">
              <span className="italic font-medium text-sm">**(Sin costes adiccionales)</span>
              <span>0.00</span>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-white text-lg">Ubicación:</span>
            <div className="w-full flex justify-end space-x-2 text-slate-950">
              <CountrySelector
                id={"country-selector"}
                open={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
                onChange={setCountry}
                selectedValue={COUNTRIES.find(c => c.value === country) ?? COUNTRIES[0]}
                disabled={true}
              />
            </div>
          </div>
          <div className="border-t border-slate-600 p-4 flex justify-between items-center bg-slate-800">
            <span className="text-white text-xl font-semibold">*Total:</span>
            <span className="text-white text-xl font-bold">{finalPrice}</span>
          </div>
          <p className="text-sm text-slate-400 p-4">*El precio final en euros, incluye todos los impuestos aplicables.</p>
          <p className="text-sm text-slate-400 p-4 pt-0">**Únicamente sin costes adiccionales en España, Islas Baleares, Pollença.</p>
          
        </div>
        <CheckoutSheet />
        
    </motion.div>
  )
}