-- AlterEnum
ALTER TYPE "FulfillmentStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "FulfillmentStatus" ADD VALUE 'DELIVERED';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "OrderStatus" ADD VALUE 'READY_FOR_FULFILLMENT';
ALTER TYPE "OrderStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERED';

-- AlterTable
ALTER TABLE "fulfillments" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "costPrice" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "productNameSnapshot" TEXT,
ADD COLUMN     "skuSnapshot" TEXT,
ADD COLUMN     "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "salesRepId" TEXT;

-- CreateIndex
CREATE INDEX "fulfillments_assignedToId_idx" ON "fulfillments"("assignedToId");

-- CreateIndex
CREATE INDEX "order_items_variantId_idx" ON "order_items"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_quotationId_key" ON "orders"("quotationId");

-- CreateIndex
CREATE INDEX "orders_salesRepId_idx" ON "orders"("salesRepId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_salesRepId_fkey" FOREIGN KEY ("salesRepId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
