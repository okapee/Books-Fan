import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "okapee.masapiro@gmail.com";

  console.log(`管理者権限を設定しています: ${email}`);

  const user = await prisma.user.update({
    where: { email },
    data: { role: UserRole.ADMIN },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("✅ 管理者権限を設定しました:");
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((e) => {
    console.error("エラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
