/**
 * SEO関連のユーティリティ関数
 */

import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://books-fan.com";
const siteName = "Books Fan";
const defaultDescription = "Books Fanは、本のレビューを共有し、AIで要約・分析できるプラットフォームです。あなたの読書体験をより豊かにします。";

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}

/**
 * ページのメタデータを生成
 */
export function generateMetadata({
  title,
  description = defaultDescription,
  image = `${siteUrl}/og-image.png`,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  keywords = ["本", "レビュー", "書評", "読書", "AI要約", "おすすめ本", "ブックレビュー"],
}: GenerateMetadataParams = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: siteName }],
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "ja_JP",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: fullUrl,
    },
  };

  // 記事の場合の追加情報
  if (type === "article" && (publishedTime || modifiedTime)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime,
      modifiedTime,
    };
  }

  return metadata;
}

/**
 * 書籍レビューページのメタデータを生成
 */
export function generateBookReviewMetadata(
  bookTitle: string,
  bookAuthor: string,
  reviewExcerpt: string,
  rating: number,
  bookImage?: string
): Metadata {
  const title = `${bookTitle} - レビュー`;
  const description = `${bookAuthor}著「${bookTitle}」のレビュー。評価: ${rating}/5 - ${reviewExcerpt.substring(0, 100)}...`;

  return generateMetadata({
    title,
    description,
    image: bookImage,
    type: "article",
    keywords: [
      "本",
      "レビュー",
      "書評",
      bookTitle,
      bookAuthor,
      "読書",
      "おすすめ本",
    ],
  });
}

/**
 * 構造化データ（JSON-LD）を生成
 */
export function generateBookReviewStructuredData(
  bookTitle: string,
  bookAuthor: string,
  bookImage: string | undefined,
  rating: number,
  reviewBody: string,
  reviewAuthor: string,
  datePublished: string,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Book",
      "name": bookTitle,
      "author": {
        "@type": "Person",
        "name": bookAuthor,
      },
      "image": bookImage,
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": rating,
      "bestRating": 5,
      "worstRating": 1,
    },
    "author": {
      "@type": "Person",
      "name": reviewAuthor,
    },
    "reviewBody": reviewBody.substring(0, 200),
    "datePublished": datePublished,
    "url": `${siteUrl}${url}`,
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": siteUrl,
    },
  };
}

/**
 * WebSite構造化データを生成
 */
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "description": defaultDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/books?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
