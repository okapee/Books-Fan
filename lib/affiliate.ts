/**
 * アフィリエイトリンク生成ユーティリティ
 */

// Amazon アソシエイトID（環境変数から取得）
const AMAZON_ASSOCIATE_ID = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || "";

// 楽天アフィリエイトID（環境変数から取得）
const RAKUTEN_AFFILIATE_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID || "";

/**
 * Amazon アソシエイトリンクを生成
 * @param isbn ISBN番号（13桁または10桁）
 * @param title 本のタイトル（検索用）
 * @returns Amazonアフィリエイトリンク
 */
export function generateAmazonAffiliateLink(isbn?: string | null, title?: string): string {
  if (!AMAZON_ASSOCIATE_ID) {
    // アフィリエイトIDが設定されていない場合は通常のリンク
    console.warn("NEXT_PUBLIC_AMAZON_ASSOCIATE_ID is not set");
  }

  // ISBNがある場合はISBN検索
  if (isbn) {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    return `https://www.amazon.co.jp/dp/${cleanIsbn}${AMAZON_ASSOCIATE_ID ? `?tag=${AMAZON_ASSOCIATE_ID}` : ""}`;
  }

  // ISBNがない場合はタイトル検索
  if (title) {
    const encodedTitle = encodeURIComponent(title);
    return `https://www.amazon.co.jp/s?k=${encodedTitle}${AMAZON_ASSOCIATE_ID ? `&tag=${AMAZON_ASSOCIATE_ID}` : ""}`;
  }

  // どちらもない場合は本のトップページ
  return `https://www.amazon.co.jp/books${AMAZON_ASSOCIATE_ID ? `?tag=${AMAZON_ASSOCIATE_ID}` : ""}`;
}

/**
 * 楽天ブックスアフィリエイトリンクを生成
 * @param isbn ISBN番号（13桁または10桁）
 * @param title 本のタイトル（検索用）
 * @returns 楽天ブックスアフィリエイトリンク
 */
export function generateRakutenAffiliateLink(isbn?: string | null, title?: string): string {
  if (!RAKUTEN_AFFILIATE_ID) {
    console.warn("NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID is not set");
  }

  // ISBNがある場合はISBN検索
  if (isbn) {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");

    if (RAKUTEN_AFFILIATE_ID) {
      // 楽天ブックスの検索ページにアフィリエイトパラメータを追加
      return `https://books.rakuten.co.jp/search?sitem=${cleanIsbn}&scid=af_pc_etc&sc2id=${RAKUTEN_AFFILIATE_ID}`;
    }

    return `https://books.rakuten.co.jp/search?sitem=${cleanIsbn}`;
  }

  // ISBNがない場合はタイトル検索
  if (title) {
    const encodedTitle = encodeURIComponent(title);

    if (RAKUTEN_AFFILIATE_ID) {
      return `https://books.rakuten.co.jp/search?sitem=${encodedTitle}&scid=af_pc_etc&sc2id=${RAKUTEN_AFFILIATE_ID}`;
    }

    return `https://books.rakuten.co.jp/search?sitem=${encodedTitle}`;
  }

  // どちらもない場合は楽天ブックスのトップページ
  if (RAKUTEN_AFFILIATE_ID) {
    return `https://books.rakuten.co.jp/?scid=af_pc_etc&sc2id=${RAKUTEN_AFFILIATE_ID}`;
  }

  return "https://books.rakuten.co.jp/";
}

/**
 * アフィリエイトIDが設定されているかチェック
 */
export function hasAffiliateIds(): {
  hasAmazon: boolean;
  hasRakuten: boolean;
} {
  return {
    hasAmazon: !!AMAZON_ASSOCIATE_ID,
    hasRakuten: !!RAKUTEN_AFFILIATE_ID,
  };
}
