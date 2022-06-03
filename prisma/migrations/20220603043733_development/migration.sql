-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" SERIAL NOT NULL,
    "guild_id" VARCHAR(18),

    CONSTRAINT "GuildConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConfig" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(18),

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfig_guild_id_key" ON "GuildConfig"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_user_id_key" ON "UserConfig"("user_id");
