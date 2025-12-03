"use client";

import { urlImageProductPath } from '@/lib/pathImage'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { motion } from 'framer-motion'; // Importa motion


export default function SuccessPaymentWidgets({imageProduct, amount, clientId}: {imageProduct: {image: string} | null, amount: string, clientId: string}) {
  return (
    <>
        {imageProduct && imageProduct.image && (
          <motion.div
          className="mt-8 w-64 h-64 relative "
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
                src={urlImageProductPath(imageProduct.image)}
                alt="Product Image"
                width={500}
                height={500}
                className="w-full h-full object-cover rounded-lg scale-150"
                />
            </Link>
          </motion.div>
        )}

        <div className="w-full flex flex-row gap-y-2 space-x-3 z-10">
          
          
          <Link href={`https://wa.me/34643567016?text=Hola,%20he%20realizado%20un%20pedido%20de%20${amount}€.%20Mi%20ID%20de%20cliente%20es:%20${clientId}.`} target="_blank" rel="noopener noreferrer">
            <div className="w-auto flex-row justify-center items-center p-4 bg-green-800 rounded-lg">
              <FaWhatsapp className="text-white" size={40}/>
            </div>
          </Link>
          <Link href={"/orders"} className="w-full text-center p-4 bg-green-400 rounded-lg text-3xl font-calistoga ">
            <span className='text-green-900'>Ver pedidos</span>
          </Link>
          
        </div>
    </>
  )
}
