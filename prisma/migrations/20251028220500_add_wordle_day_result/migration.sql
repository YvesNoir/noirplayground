-- CreateTable
CREATE TABLE "WordleDay" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordleDay_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WordleDay_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordleResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordleDayId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "solved" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordleResult_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WordleResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WordleResult_wordleDayId_fkey" FOREIGN KEY ("wordleDayId") REFERENCES "WordleDay"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WordleDay_date_key" ON "WordleDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "WordleDay_wordId_key" ON "WordleDay"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "WordleResult_userId_wordleDayId_key" ON "WordleResult"("userId", "wordleDayId");
