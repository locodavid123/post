-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "address" TEXT,
ADD COLUMN     "alertSound" TEXT NOT NULL DEFAULT 'ping',
ADD COLUMN     "enableJukebox" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableQrOrders" BOOLEAN NOT NULL DEFAULT true;
