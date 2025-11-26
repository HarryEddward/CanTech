/*
  Warnings:

  - You are about to drop the column `orderId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Order` table. All the data in the column will be lost.
  - Made the column `stripeCustomerId` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `clientId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_orderId_fkey";

-- DropIndex
DROP INDEX "Client_orderId_key";

-- DropIndex
DROP INDEX "Client_token_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "orderId",
DROP COLUMN "token",
ALTER COLUMN "stripeCustomerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "stripeCustomerId",
ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "image" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
