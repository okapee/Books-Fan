import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: {
      title: true,
      slug: true,
      content: true,
    },
  });

  for (const post of posts) {
    console.log(`\n=== ${post.title} ===`);
    console.log(`Slug: ${post.slug}\n`);

    // 画像URLを抽出
    const imageMatches = post.content.match(/!\[.*?\]\((.*?)\)/g);
    if (imageMatches) {
      console.log("画像:");
      imageMatches.forEach((match, index) => {
        const urlMatch = match.match(/!\[(.*?)\]\((.*?)\)/);
        if (urlMatch) {
          console.log(`  ${index + 1}. Alt: "${urlMatch[1]}", URL: ${urlMatch[2]}`);
        }
      });
    } else {
      console.log("画像: なし");
    }

    // テーブルを抽出
    const tableMatches = post.content.match(/\|.*\|/g);
    if (tableMatches && tableMatches.length > 2) {
      console.log("\nテーブル: あり");
      console.log(`  ${tableMatches.slice(0, 3).join('\n  ')}`);
      if (tableMatches.length > 3) {
        console.log(`  ... (${tableMatches.length - 3} more lines)`);
      }
    } else {
      console.log("\nテーブル: なし");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
