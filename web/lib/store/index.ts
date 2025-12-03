// store/cart.ts (o donde tengas el store)
"use client";

import { Product } from "@/generated/prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  product: Product | null; // Ahora es un solo producto o null
  addProduct: (product: Product) => void;
  removeProduct: () => void; // No necesita ID, solo remueve el actual
  clear: () => void; // Igual que remove en este caso
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      product: null, // Inicialmente vacío

      addProduct: (product) => {
        // Simplemente reemplaza el producto actual
        set({ product: product });
      },

      removeProduct: () => {
        // Elimina el producto actual
        set({ product: null });
      },

      clear: () => {
        // Igual que remove en este contexto
        set({ product: null });
      },
    }),
    {
      name: "cart-storage", // localStorage key
    }
  )
);