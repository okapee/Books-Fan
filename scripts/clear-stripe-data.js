const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // すべてのユーザーのStripe関連フィールドをクリア
  const result = await prisma.user.updateMany({
    where: {
      stripeCustomerId: {
        not: null
      }
    },
    data: {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: 'NONE',
      membershipType: 'FREE',
      currentPeriodEnd: null
    }
  });

  console.log(`✅ ${result.count}件のユーザーのStripe情報をクリアしました`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
