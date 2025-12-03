import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Create multiple users
  await prisma.product.createMany({
    data: [
      {

      },
      { name: "Producto 2", description: "Descripción del producto 2", price: 2000, image: "https://www.cantech.pro/images/products/product_2.webp", stock: 20 },
      { name: "Producto 3", description: "Descripción del producto 3", price: 8000, image: "https://www.cantech.pro/images/products/product_3.webp", stock: 5 },
    ],
    //skipDuplicates: true, // prevents errors if you run the seed multiple times
  });

  await prisma.client.createMany({
    data: [
      
    ],
    //skipDuplicates: true, // prevents errors if you run the seed multiple times
  });

  await prisma.order.createMany({
    data: [
    
    ],
    //skipDuplicates: true, // prevents errors if you run the seed multiple times
  });

  

  console.log("Seed data inserted!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
