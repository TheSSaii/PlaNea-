-- CreateTable
CREATE TABLE "Subplan" (
    "id" UUID NOT NULL,
    "placeName" TEXT NOT NULL,
    "placeId" TEXT,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "planId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subplan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subplan_planId_idx" ON "Subplan"("planId");

-- AddForeignKey
ALTER TABLE "Subplan" ADD CONSTRAINT "Subplan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
