/*
  Warnings:

  - Changed the type of `status` on the `TripLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TripStatusLog" AS ENUM ('AVAILABLE', 'PENDING', 'ON_THE_WAY', 'WAITING_FOR_CUSTOMER', 'DRIVING', 'FINISHED', 'CANCELED', 'CANCELED_BY_DRIVER', 'REJECTED');

-- AlterTable
ALTER TABLE "TripLog" DROP COLUMN "status",
ADD COLUMN     "status" "TripStatusLog" NOT NULL;
