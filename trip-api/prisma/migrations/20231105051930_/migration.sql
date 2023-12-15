-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "outsideCustomerFullname" TEXT,
ADD COLUMN     "outsideCustomerPhone" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "ratingComment" TEXT;
