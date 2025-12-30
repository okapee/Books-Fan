import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 日本の人気書籍のサンプルデータ
const sampleBooks = [
  {
    googleBooksId: "book_jp_1",
    title: "人生は、運よりも実力よりも「勘違いさせる力」で決まっている",
    author: "ふろむだ",
    categories: ["ビジネス", "自己啓発"],
    description:
      "「錯覚資産」を使って、人生を切り開く方法を解説。科学的根拠に基づいた実践的な内容。",
    coverImageUrl: "https://placehold.co/150x220/4F46E5/FFFFFF/png?text=錯覚資産",
  },
  {
    googleBooksId: "book_jp_2",
    title: "嫌われる勇気",
    author: "岸見一郎、古賀史健",
    categories: ["哲学", "自己啓発"],
    description:
      "アドラー心理学を対話形式で解説。「すべての悩みは対人関係である」という考えを基に、幸せになるための方法を説く。",
    coverImageUrl: "https://placehold.co/150x220/EC4899/FFFFFF/png?text=嫌われる勇気",
  },
  {
    googleBooksId: "book_jp_3",
    title: "ファクトフルネス",
    author: "ハンス・ロスリング",
    categories: ["ノンフィクション", "教育"],
    description:
      "データに基づいて世界を正しく見る習慣。10の思い込みを乗り越え、データを基に世界を読み解く方法。",
    coverImageUrl: "https://placehold.co/150x220/10B981/FFFFFF/png?text=FACT",
  },
  {
    googleBooksId: "book_jp_4",
    title: "1984年",
    author: "ジョージ・オーウェル",
    categories: ["小説", "フィクション", "ディストピア"],
    description:
      "全体主義国家による監視社会を描いた古典的ディストピア小説。現代にも通じる警鐘。",
    coverImageUrl: "https://placehold.co/150x220/EF4444/FFFFFF/png?text=1984",
  },
  {
    googleBooksId: "book_jp_5",
    title: "サピエンス全史",
    author: "ユヴァル・ノア・ハラリ",
    categories: ["歴史", "ノンフィクション"],
    description:
      "ホモ・サピエンスの歴史を壮大なスケールで描く。認知革命、農業革命、科学革命という3つの革命を軸に人類史を読み解く。",
    coverImageUrl: "https://placehold.co/150x220/F59E0B/FFFFFF/png?text=サピエンス",
  },
  {
    googleBooksId: "book_jp_6",
    title: "夜と霧",
    author: "ヴィクトール・E・フランクル",
    categories: ["ノンフィクション", "哲学", "心理学"],
    description:
      "強制収容所での体験から見出された人間の尊厳と生きる意味。心理学者による深い洞察。",
    coverImageUrl: "https://placehold.co/150x220/8B5CF6/FFFFFF/png?text=夜と霧",
  },
  {
    googleBooksId: "book_jp_7",
    title: "ノルウェイの森",
    author: "村上春樹",
    categories: ["小説", "フィクション", "恋愛"],
    description:
      "1960年代後半の東京を舞台に、喪失と再生を描いた青春小説。村上春樹の代表作の一つ。",
    coverImageUrl: "https://placehold.co/150x220/06B6D4/FFFFFF/png?text=ノルウェイ",
  },
  {
    googleBooksId: "book_jp_8",
    title: "7つの習慣",
    author: "スティーブン・R・コヴィー",
    categories: ["ビジネス", "自己啓発"],
    description:
      "全世界で3000万部を超えるベストセラー。主体性、目的、優先順位など、成功のための7つの原則を解説。",
    coverImageUrl: "https://placehold.co/150x220/14B8A6/FFFFFF/png?text=7習慣",
  },
  {
    googleBooksId: "book_jp_9",
    title: "銃・病原菌・鉄",
    author: "ジャレド・ダイアモンド",
    categories: ["歴史", "ノンフィクション", "科学"],
    description:
      "なぜある社会は他の社会を征服したのか。地理的・生態学的要因から人類史の謎を解く。",
    coverImageUrl: "https://placehold.co/150x220/F97316/FFFFFF/png?text=GGS",
  },
  {
    googleBooksId: "book_jp_10",
    title: "コンビニ人間",
    author: "村田沙耶香",
    categories: ["小説", "フィクション"],
    description:
      "36歳未婚、彼氏なし。コンビニのバイト歴18年の主人公が「普通」とは何かを問う。芥川賞受賞作。",
    coverImageUrl: "https://placehold.co/150x220/A855F7/FFFFFF/png?text=コンビニ",
  },
  {
    googleBooksId: "book_jp_11",
    title: "君たちはどう生きるか",
    author: "吉野源三郎",
    categories: ["小説", "青春", "哲学"],
    description:
      "1937年刊行の名著。中学生のコペル君と叔父さんの対話を通じて、人間としての生き方を問う。",
    coverImageUrl: "https://placehold.co/150x220/84CC16/FFFFFF/png?text=どう生きる",
  },
  {
    googleBooksId: "book_jp_12",
    title: "火花",
    author: "又吉直樹",
    categories: ["小説", "フィクション"],
    description:
      "売れない芸人の青春と葛藤を描いた芥川賞受賞作。お笑い芸人が書いた小説として話題に。",
    coverImageUrl: "https://placehold.co/150x220/22D3EE/FFFFFF/png?text=火花",
  },
  {
    googleBooksId: "book_jp_13",
    title: "Think clearly",
    author: "ロルフ・ドベリ",
    categories: ["ビジネス", "自己啓発", "心理学"],
    description:
      "よりよい人生を送るための52の思考法。認知バイアスを避け、賢明な選択をするための実践的ガイド。",
    coverImageUrl: "https://placehold.co/150x220/FB923C/FFFFFF/png?text=Think",
  },
  {
    googleBooksId: "book_jp_14",
    title: "人を動かす",
    author: "デール・カーネギー",
    categories: ["ビジネス", "自己啓発", "心理学"],
    description:
      "あらゆる自己啓発本の原点。人間関係の原則を説き、人を動かす技術を教える不朽の名著。",
    coverImageUrl: "https://placehold.co/150x220/C084FC/FFFFFF/png?text=人を動かす",
  },
  {
    googleBooksId: "book_jp_15",
    title: "FACTFULNESS（ファクトフルネス）",
    author: "ハンス・ロスリング",
    categories: ["ノンフィクション", "科学", "教育"],
    description:
      "教育、貧困、環境、エネルギー、人口問題などをテーマに、世界の真実をデータで示す。",
    coverImageUrl: "https://placehold.co/150x220/34D399/FFFFFF/png?text=FACT",
  },
];

async function seed() {
  console.log("🌱 シード処理を開始します...");

  // 既存のユーザーを取得
  const existingUsers = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`既存ユーザー数: ${existingUsers.length}`);

  if (existingUsers.length === 0) {
    console.log("⚠️ ユーザーが存在しません。先にユーザーを作成してください。");
    return;
  }

  // 1. 本を作成または更新
  console.log("\n📚 本を作成中...");
  const createdBooks = [];
  for (const bookData of sampleBooks) {
    const book = await prisma.book.upsert({
      where: { googleBooksId: bookData.googleBooksId },
      update: bookData,
      create: bookData,
    });
    createdBooks.push(book);
    console.log(`  ✓ ${book.title}`);
  }

  // 2. フォロー関係を作成（既存ユーザー間）
  if (existingUsers.length >= 2) {
    console.log("\n👥 フォロー関係を作成中...");
    // 各ユーザーが他のユーザーの一部をフォロー
    for (let i = 0; i < existingUsers.length; i++) {
      const followerId = existingUsers[i].id;
      const possibleFollowees = existingUsers.filter((u) => u.id !== followerId);

      // ランダムに1-3人をフォロー
      const followCount = Math.min(
        Math.floor(Math.random() * 3) + 1,
        possibleFollowees.length
      );
      const shuffled = possibleFollowees.sort(() => Math.random() - 0.5);
      const toFollow = shuffled.slice(0, followCount);

      for (const followee of toFollow) {
        await prisma.follow.upsert({
          where: {
            followerId_followingId: {
              followerId,
              followingId: followee.id,
            },
          },
          update: {},
          create: {
            followerId,
            followingId: followee.id,
          },
        });
        console.log(
          `  ✓ ${existingUsers[i].email} → ${followee.email} をフォロー`
        );
      }
    }
  }

  // 3. レビューを作成
  console.log("\n⭐ レビューを作成中...");
  const reviewTexts = [
    "とても感動しました。人生観が変わる一冊です。",
    "わかりやすく、実践的な内容でした。おすすめです！",
    "期待以上の内容。何度も読み返したい本です。",
    "深い洞察に満ちています。考えさせられました。",
    "面白かったです。一気に読んでしまいました。",
    "少し難しい部分もありましたが、読む価値があります。",
    "著者の視点が新鮮で、学びが多かったです。",
    "実生活に応用できる知識が詰まっています。",
  ];

  const ratings = [3, 4, 4, 5, 5, 5]; // 評価の分布（高めに設定）

  for (let i = 0; i < createdBooks.length; i++) {
    const book = createdBooks[i];
    // 各本に2-5件のレビューをランダムに作成
    const reviewCount = Math.floor(Math.random() * 4) + 2;

    const shuffledUsers = [...existingUsers].sort(() => Math.random() - 0.5);
    const reviewers = shuffledUsers.slice(0, Math.min(reviewCount, existingUsers.length));

    for (const user of reviewers) {
      const rating = ratings[Math.floor(Math.random() * ratings.length)];
      const content = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

      // 過去30日以内のランダムな日付
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const existingReview = await prisma.review.findFirst({
        where: {
          userId: user.id,
          bookId: book.id,
        },
      });

      if (!existingReview) {
        await prisma.review.create({
          data: {
            userId: user.id,
            bookId: book.id,
            rating,
            content,
            isPublic: true,
            createdAt,
          },
        });
        console.log(`  ✓ ${user.email} が "${book.title}" をレビュー (${rating}★)`);
      }
    }
  }

  // 4. お気に入りを作成
  console.log("\n❤️ お気に入りを作成中...");
  for (const user of existingUsers) {
    // 各ユーザーが3-8冊をお気に入り登録
    const favoriteCount = Math.floor(Math.random() * 6) + 3;
    const shuffledBooks = [...createdBooks].sort(() => Math.random() - 0.5);
    const favBooks = shuffledBooks.slice(0, favoriteCount);

    for (const book of favBooks) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await prisma.favoriteBook.upsert({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          bookId: book.id,
          createdAt,
        },
      });
    }
    console.log(`  ✓ ${user.email} が ${favBooks.length} 冊をお気に入り登録`);
  }

  // 5. 本の統計を更新
  console.log("\n📊 本の統計を更新中...");
  for (const book of createdBooks) {
    const reviews = await prisma.review.findMany({
      where: { bookId: book.id },
      select: { rating: true },
    });

    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await prisma.book.update({
        where: { id: book.id },
        data: {
          reviewCount: reviews.length,
          averageRating: avgRating,
        },
      });
      console.log(
        `  ✓ ${book.title}: ${reviews.length}件, 平均${avgRating.toFixed(1)}★`
      );
    }
  }

  console.log("\n✅ シード処理が完了しました！");

  // 最終的な統計を表示
  const stats = await Promise.all([
    prisma.book.count(),
    prisma.review.count(),
    prisma.follow.count(),
    prisma.favoriteBook.count(),
  ]);

  console.log("\n📈 最終統計:");
  console.log(`  書籍: ${stats[0]}冊`);
  console.log(`  レビュー: ${stats[1]}件`);
  console.log(`  フォロー: ${stats[2]}件`);
  console.log(`  お気に入り: ${stats[3]}件`);
}

seed()
  .catch((e) => {
    console.error("❌ エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
