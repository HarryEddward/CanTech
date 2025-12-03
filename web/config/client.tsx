import type { Product } from "@/generated/prisma/client"


export const mockProducts: Product[] = [
    {
        id: "cmif6sqt60001i62uwqgdm1xh",
        image: "vieta_pro_zen.webp",
        name: "Vieta Pro Zen",
        description: "Wireless earbuds with noise cancellation.",
        price: 99.99,
        stock: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "cmif6sqt70002i62uu15b90g1",
        image: "lg_xboom.webp",
        name: "LG xBoom",
        description: "Portable Bluetooth speaker.",
        price: 149.99,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "cmif6sqt60000i62umnns6qdi",
        image: "jbl_live_flex.webp",
        name: "JBL Live Flex",
        description: "High-fidelity wireless headphones.",
        price: 129.99,
        stock: 8,
        createdAt: new Date(),
        updatedAt: new Date()
    },
]