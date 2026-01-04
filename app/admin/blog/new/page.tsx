"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function NewBlogPostPage() {
  const router = useRouter();
  const createMutation = trpc.blog.create.useMutation();
  const { data: searchResults, refetch: searchBooks } = trpc.book.search.useQuery(
    { query: "", maxResults: 10 },
    { enabled: false }
  );

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
  });

  const [bookSearch, setBookSearch] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // タイトルが変更されたらスラッグを自動生成
    if (name === "title" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSearchBooks = async () => {
    if (bookSearch.trim()) {
      await searchBooks();
    }
  };

  const handleAddBook = (book: any) => {
    if (!selectedBooks.find((b) => b.id === book.id)) {
      setSelectedBooks([...selectedBooks, book]);
    }
    setBookSearch("");
  };

  const handleRemoveBook = (bookId: string) => {
    setSelectedBooks(selectedBooks.filter((b) => b.id !== bookId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      await createMutation.mutateAsync({
        ...formData,
        tags,
        relatedBookIds: selectedBooks.map((b) => b.id),
      });

      alert("ブログ記事を作成しました！");
      router.push("/admin/blog");
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
            新規ブログ記事作成
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            SEO対策された記事を作成して、Books Fanに読者を誘導しましょう
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* メインフォーム */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本情報 */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  基本情報
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="例: 半年で英語が話せるようになるロードマップ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      スラッグ（URL） <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      placeholder="english-roadmap-6-months"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL: /blog/{formData.slug || "your-slug"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      抜粋 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="記事の要約を1-2文で書いてください"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      カバー画像URL
                    </label>
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* 本文 */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    本文（Markdown）
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    {showPreview ? "編集モード" : "プレビュー"}
                  </button>
                </div>

                {!showPreview ? (
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder="# はじめに

英語学習は継続が大切です...

## ステップ1: 基礎固め

まずは..."
                  />
                ) : (
                  <div className="prose prose-sm sm:prose-base max-w-none border border-gray-300 rounded-lg p-4 min-h-[400px]">
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* 関連書籍 */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  関連書籍（Books Fanへの誘導）
                </h2>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="本を検索..."
                    />
                    <button
                      type="button"
                      onClick={handleSearchBooks}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                    >
                      検索
                    </button>
                  </div>

                  {searchResults && searchResults.books.length > 0 && (
                    <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      {searchResults.books.map((book: any) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => handleAddBook(book)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 text-left"
                        >
                          {book.coverImageUrl && (
                            <img
                              src={book.coverImageUrl}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">
                              {book.title}
                            </div>
                            <div className="text-xs text-gray-600">{book.author}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedBooks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      選択中の本 ({selectedBooks.length})
                    </h3>
                    {selectedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                      >
                        {book.coverImageUrl && (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900">
                            {book.title}
                          </div>
                          <div className="text-xs text-gray-600">{book.author}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBook(book.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 公開設定 */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">公開設定</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublished: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="font-semibold text-gray-900">
                    この記事を公開する
                  </span>
                </label>
              </div>

              {/* カテゴリ・タグ */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  カテゴリ・タグ
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      カテゴリ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">選択してください</option>
                      <option value="英語学習">英語学習</option>
                      <option value="読書術">読書術</option>
                      <option value="ビジネス">ビジネス</option>
                      <option value="自己啓発">自己啓発</option>
                      <option value="学習法">学習法</option>
                      <option value="書評">書評</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      タグ（カンマ区切り）
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="英語, 学習法, TOEIC"
                    />
                  </div>
                </div>
              </div>

              {/* SEO設定 */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">SEO設定</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SEOタイトル
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="未入力の場合はタイトルを使用"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      60文字以内推奨
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SEO説明文
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="未入力の場合は抜粋を使用"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      160文字以内推奨
                    </p>
                  </div>
                </div>
              </div>

              {/* 保存ボタン */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "保存中..." : formData.isPublished ? "公開する" : "下書き保存"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
