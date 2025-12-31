"use client";

import Head from "next/head";

interface MetaTagsProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function MetaTags({
  title = "Books Fan - 本好きのためのレビュー&推薦プラットフォーム",
  description = "Books Fanは、本のレビューを共有し、AIで要約・分析できるプラットフォームです。あなたの読書体験をより豊かにします。",
  ogImage = "https://books-fan.com/og-image.png",
  ogType = "website",
  canonicalUrl,
  keywords = "本,レビュー,書評,読書,AI要約,おすすめ本,ブックレビュー",
  author = "Books Fan",
  publishedTime,
  modifiedTime,
}: MetaTagsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://books-fan.com";
  const fullTitle = title.includes("Books Fan") ? title : `${title} | Books Fan`;
  const fullCanonicalUrl = canonicalUrl || siteUrl;

  return (
    <Head>
      {/* 基本メタタグ */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph (Facebook, LinkedIn等) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Books Fan" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* 記事の場合の追加メタタグ */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* モバイル最適化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#667eea" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  );
}
