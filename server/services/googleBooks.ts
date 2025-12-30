// Google Books API の型定義
export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    language?: string;
    averageRating?: number;
    ratingsCount?: number;
  };
}

export interface GoogleBooksSearchResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

// Google Books APIから本を検索
export async function searchBooks(
  query: string,
  maxResults: number = 20
): Promise<GoogleBooksSearchResponse> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  // APIキーがない場合でも動作するようにする（制限あり）
  const apiKeyParam = apiKey ? `&key=${apiKey}` : "";

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&maxResults=${maxResults}&langRestrict=ja${apiKeyParam}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.statusText}`);
    }

    const data: GoogleBooksSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching books:", error);
    throw error;
  }
}

// ISBNで本を検索
export async function searchBookByISBN(isbn: string): Promise<GoogleBooksVolume | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const apiKeyParam = apiKey ? `&key=${apiKey}` : "";

  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${apiKeyParam}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.statusText}`);
    }

    const data: GoogleBooksSearchResponse = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }

    return null;
  } catch (error) {
    console.error("Error searching book by ISBN:", error);
    throw error;
  }
}

// Google Books IDで本の詳細を取得
export async function getBookById(
  googleBooksId: string
): Promise<GoogleBooksVolume> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const apiKeyParam = apiKey ? `?key=${apiKey}` : "";

  const url = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}${apiKeyParam}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.statusText}`);
    }

    const data: GoogleBooksVolume = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    throw error;
  }
}

// HTMLタグを除去する関数
function stripHtmlTags(html: string | null | undefined): string | null {
  if (!html) return null;

  let text = html;

  // HTMLタグを削除（<wbr>、<br>、<p>なども含む）
  text = text.replace(/<[^>]*>/g, "");

  // HTML エンティティを変換
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&ensp;/gi, " ")
    .replace(/&emsp;/gi, " ")
    .replace(/&thinsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "…")
    .replace(/&copy;/gi, "©")
    .replace(/&reg;/gi, "®")
    .replace(/&trade;/gi, "™")
    .replace(/&deg;/gi, "°")
    .replace(/&times;/gi, "×")
    .replace(/&divide;/gi, "÷")
    .replace(/&plusmn;/gi, "±");

  // 数値エンティティを変換 (&#数字; の形式)
  text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

  // 16進数エンティティを変換 (&#x数字; の形式)
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // 残った未知のエンティティを削除
  text = text.replace(/&[a-z]+;/gi, "");

  // 複数の空白を1つに
  text = text.replace(/\s+/g, " ");

  // 前後の空白を削除
  return text.trim();
}

// Google Books APIのデータを内部のBook形式に変換
export function convertGoogleBookToBook(volume: GoogleBooksVolume) {
  const isbn = volume.volumeInfo.industryIdentifiers?.find(
    (id) => id.type === "ISBN_13" || id.type === "ISBN_10"
  )?.identifier;

  return {
    googleBooksId: volume.id,
    isbn: isbn || null,
    title: volume.volumeInfo.title,
    author: volume.volumeInfo.authors?.join(", ") || "不明",
    publisher: volume.volumeInfo.publisher || null,
    publishedDate: volume.volumeInfo.publishedDate || null,
    description: stripHtmlTags(volume.volumeInfo.description) || null,
    coverImageUrl: volume.volumeInfo.imageLinks?.thumbnail ||
                    volume.volumeInfo.imageLinks?.smallThumbnail ||
                    null,
    pageCount: volume.volumeInfo.pageCount || null,
    categories: volume.volumeInfo.categories || [],
  };
}
