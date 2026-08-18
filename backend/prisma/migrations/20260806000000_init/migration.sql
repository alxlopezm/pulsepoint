-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('high', 'medium', 'low');
CREATE TYPE "InitiativeStatus" AS ENUM ('requested', 'in_design', 'in_assessment', 'approved', 'in_development');
CREATE TYPE "InitiativeType" AS ENUM ('technology_request', 'ea_governance', 'ea_growth');
CREATE TYPE "NextStepStatus" AS ENUM ('pending', 'started', 'completed', 'overdue');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_units" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "initiatives" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "business_unit_id" UUID NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "InitiativeStatus" NOT NULL DEFAULT 'requested',
    "type" "InitiativeType" NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "updates" (
    "id" UUID NOT NULL,
    "initiative_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "next_steps" (
    "id" UUID NOT NULL,
    "initiative_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "responsible_person" TEXT,
    "due_date" DATE,
    "start_date" DATE,
    "completion_date" DATE,
    "status" "NextStepStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "next_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "business_units_name_key" ON "business_units"("name");

-- CreateIndex
CREATE INDEX "initiatives_created_by_idx" ON "initiatives"("created_by");

-- CreateIndex
CREATE INDEX "initiatives_business_unit_id_idx" ON "initiatives"("business_unit_id");

-- CreateIndex
CREATE INDEX "initiatives_status_idx" ON "initiatives"("status");

-- CreateIndex
CREATE INDEX "updates_initiative_id_idx" ON "updates"("initiative_id");

-- CreateIndex
CREATE INDEX "next_steps_initiative_id_idx" ON "next_steps"("initiative_id");

-- CreateIndex
CREATE INDEX "next_steps_due_date_idx" ON "next_steps"("due_date");

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
