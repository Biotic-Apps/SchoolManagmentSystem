-- CreateTable
CREATE TABLE "login_otps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_otps_phone_created_at_idx" ON "login_otps"("phone", "created_at");

-- CreateIndex
CREATE INDEX "login_otps_user_id_idx" ON "login_otps"("user_id");

-- CreateIndex
CREATE INDEX "login_otps_expires_at_idx" ON "login_otps"("expires_at");

-- AddForeignKey
ALTER TABLE "login_otps" ADD CONSTRAINT "login_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
