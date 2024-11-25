/*
  Warnings:

  - Added the required column `url` to the `ProcessingState` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProcessingState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ProcessingState" ("createdAt", "id", "isActive", "key", "updatedAt") SELECT "createdAt", "id", "isActive", "key", "updatedAt" FROM "ProcessingState";
DROP TABLE "ProcessingState";
ALTER TABLE "new_ProcessingState" RENAME TO "ProcessingState";
CREATE UNIQUE INDEX "ProcessingState_key_key" ON "ProcessingState"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
