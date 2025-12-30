interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  book: {
    title: string;
    author: string;
    categories: string[];
  };
  aiSummary?: {
    keyPoints: Array<{ point: string }>;
    summaryText: string;
  } | null;
}

interface AISummary {
  keyPoints: Array<{ point: string }>;
  summaryText: string;
  bookTitle?: string;
}

/**
 * レビューデータからMarkmap用のMarkdownを生成（カテゴリ別）
 */
export function generateMindMapMarkdown(
  userName: string,
  reviews: Review[],
  year?: number
): string {
  if (reviews.length === 0) {
    return `# ${userName}の読書記録\n\n## レビューがまだありません`;
  }

  const yearText = year ? ` ${year}年` : "";
  let markdown = `# ${userName}の読書記録${yearText}\n\n`;

  // カテゴリ別にグループ化
  const reviewsByCategory = new Map<string, Review[]>();

  reviews.forEach((review) => {
    const categories = review.book.categories || ["その他"];
    const primaryCategory = categories[0]; // 最初のカテゴリのみ使用
    if (!reviewsByCategory.has(primaryCategory)) {
      reviewsByCategory.set(primaryCategory, []);
    }
    reviewsByCategory.get(primaryCategory)!.push(review);
  });

  // カテゴリごとにマインドマップを構築（シンプルに）
  reviewsByCategory.forEach((categoryReviews, category) => {
    markdown += `## ${category} (${categoryReviews.length}冊)\n\n`;

    categoryReviews.slice(0, 10).forEach((review) => {
      const stars = "★".repeat(review.rating);
      markdown += `### ${review.book.title}\n`;
      markdown += `- ${review.book.author}\n`;
      markdown += `- ${stars}\n`;

      // AI要約の要点がある場合は最初の2つのみ
      if (review.aiSummary && review.aiSummary.keyPoints.length > 0) {
        review.aiSummary.keyPoints.slice(0, 2).forEach((kp) => {
          markdown += `  - ${kp.point}\n`;
        });
      }
      markdown += `\n`;
    });
  });

  return markdown;
}

/**
 * シンプルなタイムライン形式のマインドマップ（最近のレビュー順）
 */
export function generateTimelineMindMap(
  userName: string,
  reviews: Review[],
  year?: number
): string {
  if (reviews.length === 0) {
    return `# ${userName}の読書記録\n\n## レビューがまだありません`;
  }

  const yearText = year ? ` ${year}年` : "";
  let markdown = `# ${userName}の読書タイムライン${yearText}\n\n`;

  // 月ごとにグループ化
  const reviewsByMonth = new Map<string, Review[]>();

  reviews.forEach((review) => {
    const date = new Date(review.createdAt);
    const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    if (!reviewsByMonth.has(monthKey)) {
      reviewsByMonth.set(monthKey, []);
    }
    reviewsByMonth.get(monthKey)!.push(review);
  });

  reviewsByMonth.forEach((monthReviews, month) => {
    markdown += `## ${month} (${monthReviews.length}冊)\n\n`;

    monthReviews.slice(0, 10).forEach((review) => {
      const stars = "★".repeat(review.rating);
      markdown += `### ${review.book.title}\n`;
      markdown += `- ${review.book.author}\n`;
      markdown += `- ${stars}\n\n`;
    });
  });

  return markdown;
}

/**
 * 評価別マインドマップ
 */
export function generateRatingMindMap(
  userName: string,
  reviews: Review[],
  year?: number
): string {
  if (reviews.length === 0) {
    return `# ${userName}の読書記録\n\n## レビューがまだありません`;
  }

  const yearText = year ? ` ${year}年` : "";
  let markdown = `# ${userName}の読書記録${yearText}\n\n`;

  // 評価別にグループ化（5→1の順）
  for (let rating = 5; rating >= 1; rating--) {
    const ratingReviews = reviews.filter((r) => r.rating === rating);

    if (ratingReviews.length > 0) {
      const stars = "★".repeat(rating);
      markdown += `## ${stars} (${ratingReviews.length}冊)\n\n`;

      ratingReviews.slice(0, 10).forEach((review) => {
        markdown += `### ${review.book.title}\n`;
        markdown += `- ${review.book.author}\n\n`;
      });
    }
  }

  return markdown;
}

/**
 * AI要約からマインドマップ用のMarkdownを生成
 */
export function generateReviewMindMap(
  aiSummary: AISummary,
  bookTitle: string
): string {
  if (!aiSummary.keyPoints || aiSummary.keyPoints.length === 0) {
    return `# ${bookTitle}\n\n## 要点がありません`;
  }

  let markdown = `# ${bookTitle}\n\n`;

  // 要約テキスト
  if (aiSummary.summaryText) {
    markdown += `## 要約\n\n${aiSummary.summaryText}\n\n`;
  }

  // 要点
  markdown += `## 主要なポイント\n\n`;
  aiSummary.keyPoints.forEach((kp, index) => {
    markdown += `### ${index + 1}. ${kp.point}\n\n`;
  });

  return markdown;
}
