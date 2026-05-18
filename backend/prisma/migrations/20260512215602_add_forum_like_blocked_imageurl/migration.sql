-- AlterTable
ALTER TABLE "ForumTopic" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "ForumLike" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumBlockedUser" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumBlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForumLike_topicId_idx" ON "ForumLike"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumLike_topicId_username_key" ON "ForumLike"("topicId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "ForumBlockedUser_username_key" ON "ForumBlockedUser"("username");

-- AddForeignKey
ALTER TABLE "ForumLike" ADD CONSTRAINT "ForumLike_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
