"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageCropper } from "@/components/profile/ImageCropper";

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useContext();

  // 現在のユーザー情報を取得
  const { data: user, isLoading } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: !!session,
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isFormReady, setIsFormReady] = useState(false);

  // 画像アップロード関連
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ユーザーデータが読み込まれたらフォームに設定
  if (user && !isFormReady) {
    setName(user.name || "");
    setBio(user.bio || "");
    setIsFormReady(true);
  }

  // プロフィール更新ミューテーション
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      alert("プロフィールを更新しました");
      router.push("/profile");
    },
    onError: (error) => {
      alert(`エラー: ${error.message}`);
    },
  });

  // 画像ファイル選択ハンドラー
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("画像サイズは5MB以下にしてください");
      return;
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    // ファイルを読み込む
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // トリミング完了ハンドラー
  const handleCropComplete = async (croppedImageData: string) => {
    setCroppedImage(croppedImageData);
    setShowCropper(false);
    setIsUploading(true);

    try {
      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: croppedImageData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "画像のアップロードに失敗しました");
      }

      const data = await response.json();
      alert("プロフィール画像を更新しました");

      // ユーザー情報を再取得
      utils.user.getCurrent.invalidate();
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      alert(
        error instanceof Error
          ? error.message
          : "画像のアップロードに失敗しました"
      );
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("名前を入力してください");
      return;
    }

    updateProfile.mutate({
      name: name.trim(),
      bio: bio.trim() || undefined,
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              ログインが必要です
            </p>
            <Link
              href="/"
              className="text-primary hover:underline"
            >
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-primary">
              プロフィール編集
            </h1>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-primary transition"
            >
              キャンセル
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Display */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "プロフィール画像"}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-5xl border-4 border-gray-300">
                    👤
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="text-white text-sm">アップロード中...</div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                画像を変更
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                JPG, PNG, WEBP形式 (最大5MB)
              </p>
            </div>

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="山田 太郎"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {name.length}/100文字
              </p>
            </div>

            {/* Bio Field */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                自己紹介
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="読書が好きです。特にミステリー小説が好きで、週末は図書館で過ごすことが多いです。"
              />
              <p className="text-xs text-gray-500 mt-1">
                {bio.length}/500文字
              </p>
            </div>

            {/* Membership Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    会員タイプ
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {user?.membershipType === "PREMIUM"
                      ? "プレミアム会員"
                      : "無料会員"}
                  </p>
                </div>
                {user?.membershipType === "FREE" && (
                  <Link
                    href="/upgrade"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                  >
                    アップグレード
                  </Link>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfile.isPending ? "更新中..." : "保存する"}
              </button>
              <Link
                href="/profile"
                className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>

          {/* Error Display */}
          {updateProfile.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                エラー: {updateProfile.error.message}
              </p>
            </div>
          )}
        </div>

        {/* Image Cropper Modal */}
        {showCropper && selectedImage && (
          <ImageCropper
            image={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={() => {
              setShowCropper(false);
              setSelectedImage(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
