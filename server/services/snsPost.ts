/**
 * SNS投稿テキスト生成サービス
 * 本のレビューからX投稿用のテキストを生成
 */

import { generateAmazonAffiliateLink } from "@/lib/affiliate";

// X の文字数制限（日本語は1文字=1としてカウント）
// URLは最大23文字としてカウントされる
const MAX_TWEET_LENGTH = 280;
const URL_LENGTH = 23;

interface BookInfo {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  googleBooksId?: string | null;
  averageRating?: number | null;
}

interface ReviewInfo {
  content: string;
  rating: number;
}

/**
 * 評価を星マークに変換
 */
function ratingToStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return "★".repeat(fullStars) + (hasHalfStar ? "☆" : "") + "☆".repeat(emptyStars);
}

/**
 * テキストを指定した長さにトリミング
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 1) + "…";
}

/**
 * Books Fanの本詳細ページURLを生成
 */
function generateBooksFanUrl(bookId: string, googleBooksId?: string | null): string {
  // googleBooksIdがあればそれを使用、なければ内部IDを使用
  const id = googleBooksId || bookId;
  return `https://books-fan.com/books/${id}`;
}

/**
 * X投稿用のテキストを生成
 */
export function generateTweetText(book: BookInfo, review?: ReviewInfo): string {
  const amazonLink = generateAmazonAffiliateLink(book.isbn, book.title);
  const booksFanUrl = generateBooksFanUrl(book.id, book.googleBooksId);

  // 固定部分の長さを計算
  // フォーマット:
  // 📚『タイトル』/ 著者
  // ★★★★☆（4.0）
  // 「レビュー...」
  // 🔗 詳細: URL
  // 📖 購入: URL
  // #読書 #本 #書評

  const rating = review?.rating ?? book.averageRating ?? 0;
  const stars = ratingToStars(rating);
  const ratingText = `${stars}（${rating.toFixed(1)}）`;

  // 著者名は長い場合トリミング
  const authorDisplay = truncateText(book.author, 20);

  // タイトルは長い場合トリミング
  const titleDisplay = truncateText(book.title, 40);

  // 固定テンプレート（レビュー部分を除く）
  const headerLine = `📚『${titleDisplay}』/ ${authorDisplay}`;
  const ratingLine = ratingText;
  const linksLine = `🔗 詳細: ${booksFanUrl}\n📖 購入: ${amazonLink}`;
  const hashtagsLine = "#読書 #本 #書評";

  // 固定部分の長さ（URLは23文字としてカウント）
  const fixedLength =
    headerLine.length +
    1 + // 改行
    ratingLine.length +
    1 + // 改行
    2 + // 「」
    1 + // 改行
    "🔗 詳細: ".length +
    URL_LENGTH +
    1 + // 改行
    "📖 購入: ".length +
    URL_LENGTH +
    1 + // 改行
    hashtagsLine.length;

  // レビューに使える最大文字数
  const maxReviewLength = MAX_TWEET_LENGTH - fixedLength - 5; // 余裕を持たせる

  let reviewText = "";
  if (review?.content) {
    // レビュー内容を整形（改行を削除）
    const cleanedContent = review.content.replace(/\n+/g, " ").trim();
    reviewText = truncateText(cleanedContent, Math.max(50, maxReviewLength));
  }

  // 最終的なツイートテキストを組み立て
  const parts = [headerLine, ratingLine];

  if (reviewText) {
    parts.push(`「${reviewText}」`);
  }

  parts.push(linksLine, hashtagsLine);

  return parts.join("\n");
}

/**
 * 投稿テキストの文字数を検証
 */
export function validateTweetLength(text: string): {
  isValid: boolean;
  length: number;
  maxLength: number;
} {
  // URLを23文字としてカウントする簡易計算
  // 実際のTwitterのカウントロジックはもっと複雑だが、安全側に倒す
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern) || [];
  let adjustedLength = text.length;

  for (const url of urls) {
    adjustedLength = adjustedLength - url.length + URL_LENGTH;
  }

  return {
    isValid: adjustedLength <= MAX_TWEET_LENGTH,
    length: adjustedLength,
    maxLength: MAX_TWEET_LENGTH,
  };
}
