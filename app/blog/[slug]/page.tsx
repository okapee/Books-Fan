"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { BookCard } from "@/components/book/BookCard";
import { BlogCard } from "@/components/blog/BlogCard";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug });
  const { data: relatedPosts } = trpc.blog.getRelated.useQuery(
    { slug, limit: 3 },
    { enabled: !!post }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            記事が見つかりません
          </h1>
          <Link
            href="/blog"
            className="text-purple-600 hover:underline font-semibold"
          >
            ブログ一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* パンくず */}
        <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <Link href="/" className="hover:text-purple-600">
            ホーム
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-purple-600">
            ブログ
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate">
            {post.title}
          </span>
        </div>

        {/* 記事本文 */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* カバー画像 */}
          {post.coverImage && (
            <div className="aspect-video overflow-hidden bg-gray-200">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4 sm:p-8">
            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="inline-block bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full">
                {post.category}
              </span>
              {post.publishedAt && (
                <span className="text-xs sm:text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
              )}
              <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {post.viewCount.toLocaleString()} views
              </span>
            </div>

            {/* タイトル */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {post.title}
            </h1>

            {/* SNSシェアボタン */}
            <div className="mb-6 sm:mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm font-semibold text-gray-700 mr-2">
                  シェア:
                </span>

                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition text-xs sm:text-sm font-semibold"
                  title="Xでシェア"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="hidden sm:inline">X</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#1877F2] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#0d65d9] transition text-xs sm:text-sm font-semibold"
                  title="Facebookでシェア"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="hidden sm:inline">Facebook</span>
                </a>

                {/* LINE */}
                <a
                  href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#06C755] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#05b34c] transition text-xs sm:text-sm font-semibold"
                  title="LINEでシェア"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  <span className="hidden sm:inline">LINE</span>
                </a>

                {/* はてなブックマーク */}
                <a
                  href={`https://b.hatena.ne.jp/entry/${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#00A4DE] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#0090c5] transition text-xs sm:text-sm font-semibold"
                  title="はてなブックマークに追加"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.47 0c1.92 0 3.48 1.56 3.48 3.48v17.04c0 1.92-1.56 3.48-3.48 3.48H3.53C1.61 24 .05 22.44.05 20.52V3.48C.05 1.56 1.61 0 3.53 0h16.94zM8.95 8.26H6.32v6.26h2.63c1.26 0 2.2-.26 2.88-.79.67-.52 1.01-1.28 1.01-2.28 0-.99-.34-1.75-1.01-2.26-.68-.52-1.62-.93-2.88-.93zm.28 5.12h-1.1V9.45h1.1c1.53 0 2.29.67 2.29 2 0 1.32-.76 1.93-2.29 1.93zm7.93-5.12h-1.64v3.93c0 .22.05.39.14.51.09.12.25.18.48.18.12 0 .24-.01.35-.04.11-.02.21-.05.29-.08l.17 1.23c-.21.08-.43.14-.67.19-.24.05-.49.07-.75.07-.59 0-1.05-.15-1.38-.46-.33-.31-.49-.76-.49-1.35V8.26h-1.11V7.03h1.11V5.28l1.5-.46v2.21h1.64v1.23zm-3.43 6.7c-.27 0-.5-.09-.68-.27-.19-.18-.28-.41-.28-.68s.09-.5.28-.68c.18-.18.41-.27.68-.27s.5.09.68.27c.19.18.28.41.28.68s-.09.5-.28.68c-.18.18-.41.27-.68.27z"/>
                  </svg>
                  <span className="hidden sm:inline">はてブ</span>
                </a>

                {/* リンクをコピー */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
                    alert('リンクをコピーしました！');
                  }}
                  className="flex items-center gap-1.5 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition text-xs sm:text-sm font-semibold"
                  title="リンクをコピー"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">コピー</span>
                </button>
              </div>
            </div>

            {/* 著者情報 */}
            <div className="flex items-center gap-3 pb-6 border-b border-gray-200 mb-6 sm:mb-8">
              {post.author.image && (
                <img
                  src={post.author.image}
                  alt={post.author.name || "著者"}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                />
              )}
              <div>
                <div className="font-semibold text-sm sm:text-base text-gray-900">
                  {post.author.name || "匿名"}
                </div>
                {post.author.bio && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    {post.author.bio}
                  </div>
                )}
              </div>
            </div>

            {/* 記事本文（Markdown） */}
            <div className="prose prose-sm sm:prose-xl max-w-none
              prose-headings:font-bold prose-headings:mt-16 prose-headings:mb-10
              prose-h1:text-4xl sm:prose-h1:text-5xl prose-h1:mt-20 prose-h1:mb-12 prose-h1:leading-tight
              prose-h2:text-3xl sm:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-10 prose-h2:leading-snug
              prose-h3:text-2xl sm:prose-h3:text-3xl prose-h3:mt-14 prose-h3:mb-8
              prose-h4:text-xl sm:prose-h4:text-2xl prose-h4:mt-12 prose-h4:mb-6
              prose-p:text-lg sm:prose-p:text-xl prose-p:leading-loose prose-p:mb-10 prose-p:mt-0
              prose-li:text-lg sm:prose-li:text-xl prose-li:leading-loose prose-li:my-4 prose-li:mb-6
              prose-ul:my-12 prose-ul:space-y-4 prose-ol:my-12 prose-ol:space-y-4
              prose-a:text-purple-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-16
              prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:my-12 prose-blockquote:italic
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:my-12
              prose-hr:my-16 prose-hr:border-gray-300
              prose-strong:font-bold prose-strong:text-gray-900
              prose-em:italic prose-em:text-gray-700
              leading-loose
              [&>*]:mb-8
              [&>h2]:!mt-20
              [&>h3]:!mt-16
              [&>ul]:!mb-12
              [&>ol]:!mb-12
              [&>p]:!mb-10">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* タグ */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-700 text-xs sm:text-sm px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 記事下部のシェアボタン */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm sm:text-base font-semibold text-gray-700 mb-4">
                この記事が役に立ったら、シェアしていただけると嬉しいです！
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition text-xs sm:text-sm font-semibold"
                  title="Xでシェア"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Xでシェア</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#1877F2] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#0d65d9] transition text-xs sm:text-sm font-semibold"
                  title="Facebookでシェア"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebookでシェア</span>
                </a>

                {/* LINE */}
                <a
                  href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#06C755] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#05b34c] transition text-xs sm:text-sm font-semibold"
                  title="LINEでシェア"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  <span>LINEでシェア</span>
                </a>

                {/* はてなブックマーク */}
                <a
                  href={`https://b.hatena.ne.jp/entry/${encodeURIComponent(`${window.location.origin}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#00A4DE] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#0090c5] transition text-xs sm:text-sm font-semibold"
                  title="はてなブックマークに追加"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.47 0c1.92 0 3.48 1.56 3.48 3.48v17.04c0 1.92-1.56 3.48-3.48 3.48H3.53C1.61 24 .05 22.44.05 20.52V3.48C.05 1.56 1.61 0 3.53 0h16.94zM8.95 8.26H6.32v6.26h2.63c1.26 0 2.2-.26 2.88-.79.67-.52 1.01-1.28 1.01-2.28 0-.99-.34-1.75-1.01-2.26-.68-.52-1.62-.93-2.88-.93zm.28 5.12h-1.1V9.45h1.1c1.53 0 2.29.67 2.29 2 0 1.32-.76 1.93-2.29 1.93zm7.93-5.12h-1.64v3.93c0 .22.05.39.14.51.09.12.25.18.48.18.12 0 .24-.01.35-.04.11-.02.21-.05.29-.08l.17 1.23c-.21.08-.43.14-.67.19-.24.05-.49.07-.75.07-.59 0-1.05-.15-1.38-.46-.33-.31-.49-.76-.49-1.35V8.26h-1.11V7.03h1.11V5.28l1.5-.46v2.21h1.64v1.23zm-3.43 6.7c-.27 0-.5-.09-.68-.27-.19-.18-.28-.41-.28-.68s.09-.5.28-.68c.18-.18.41-.27.68-.27s.5.09.68.27c.19.18.28.41.28.68s-.09.5-.28.68c-.18.18-.41.27-.68.27z"/>
                  </svg>
                  <span>はてブ</span>
                </a>

                {/* リンクをコピー */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
                    alert('リンクをコピーしました！');
                  }}
                  className="flex items-center gap-1.5 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition text-xs sm:text-sm font-semibold"
                  title="リンクをコピー"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>リンクをコピー</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* 関連書籍（Books Fanへの誘導） */}
        {post.relatedBooks && post.relatedBooks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              📚 この記事で紹介している本
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Books Fanで詳しいレビューをチェックできます
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {post.relatedBooks.map((item: any) => (
                <div key={item.id}>
                  <BookCard
                    id={item.book.id}
                    googleBooksId={item.book.googleBooksId}
                    title={item.book.title}
                    author={item.book.author}
                    coverImageUrl={item.book.coverImageUrl}
                    averageRating={item.book.averageRating}
                    reviewCount={item.book.reviewCount}
                    description={item.book.description}
                  />
                  {item.note && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700">
                        💡 {item.note}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Books Fanへの誘導CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
            もっと本を探す
          </h2>
          <p className="text-sm sm:text-base mb-4 sm:mb-6">
            Books Fanでは、様々な本のレビューを読んだり、自分のレビューを投稿したりできます。あなたにぴったりの一冊を見つけましょう！
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/books"
              className="flex-1 bg-white text-purple-600 text-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:shadow-lg transition"
            >
              📖 本を探す
            </Link>
            <Link
              href="/books?tab=search"
              className="flex-1 bg-purple-700 text-white text-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-purple-800 transition"
            >
              🔍 本を検索
            </Link>
          </div>
        </div>

        {/* 関連記事 */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              関連記事
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {relatedPosts.map((relatedPost: any) => (
                <BlogCard
                  key={relatedPost.id}
                  slug={relatedPost.slug}
                  title={relatedPost.title}
                  excerpt={relatedPost.excerpt}
                  coverImage={relatedPost.coverImage}
                  category={relatedPost.category}
                  publishedAt={relatedPost.publishedAt}
                  author={relatedPost.author}
                  viewCount={relatedPost.viewCount}
                />
              ))}
            </div>
          </div>
        )}

        {/* ブログ一覧へ戻る */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-block bg-white text-purple-600 border-2 border-purple-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-purple-50 transition"
          >
            ← ブログ一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
