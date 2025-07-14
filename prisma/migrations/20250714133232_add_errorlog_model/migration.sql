-- CreateTable
CREATE TABLE "ErrorLogs" (
    "id" SERIAL NOT NULL,
    "error" JSONB NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorLogs_pkey" PRIMARY KEY ("id")
);
