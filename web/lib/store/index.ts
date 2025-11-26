"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Item {
  id: string;
  title: string;
  price: number;
  qty: number;
}

interface CartStore {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const exists = items.find((i) => i.id === item.id);

        if (exists) {
          return set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
            ),
          });
        }

        set({ items: [...items, item] });
      },

      removeItem: (id) =>
        set({
          items: get().items.filter((i) => i.id !== id),
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // localStorage key
    }
  )
);
