"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-6 rounded-full">
            <WifiOff className="w-16 h-16 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            オフラインです
          </h1>
          <p className="text-gray-600">
            インターネット接続を確認してください
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Books Fanを利用するにはインターネット接続が必要です。
            <br />
            接続が復旧したら、下のボタンで再読み込みしてください。
          </p>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            再読み込み
          </button>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">
            オフライン時にできること
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>以前に閲覧したページの一部は、キャッシュから表示できる場合があります</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>新しいレビューの投稿や本の検索には、インターネット接続が必要です</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
