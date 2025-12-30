require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSubscription() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        stripeSubscriptionId: 'sub_1SjW0GC9FUAUE2vPEmJ3EWM6'
      },
      data: {
        membershipType: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        currentPeriodEnd: new Date('2026-01-29T02:16:12.000Z')
      }
    });

    console.log(`✅ ${result.count}件のユーザーをPREMIUMに更新しました`);

    // 確認
    const user = await prisma.user.findFirst({
      where: {
        stripeSubscriptionId: 'sub_1SjW0GC9FUAUE2vPEmJ3EWM6'
      },
      select: {
        email: true,
        membershipType: true,
        subscriptionStatus: true,
        currentPeriodEnd: true
      }
    });

    console.log('\n更新後のユーザー情報:');
    console.log(JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubscription();
