# Books Fan Androidアプリ開発プラン

## 概要

Books FanのAndroidアプリを段階的に開発・配布するための実装計画です。

---

## Phase 1: PWA（Progressive Web App）実装

### 目標
既存のWebアプリをPWA化し、Androidユーザーがホーム画面に追加して使えるようにする。

### 所要時間
1-2週間

### メリット
- ✅ 既存のNext.jsコードをそのまま活用
- ✅ iOS/Android両対応
- ✅ オフライン対応
- ✅ プッシュ通知可能
- ✅ ホーム画面に追加可能
- ✅ 追加コストなし

---

## Phase 1 実装ステップ

### Step 1: Web App Manifest作成

**ファイル:** `public/manifest.json`

```json
{
  "name": "Books Fan - 読書レビュー＆推薦",
  "short_name": "Books Fan",
  "description": "本好きのためのレビュー&推薦プラットフォーム",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a365d",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["books", "education", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/discover.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Step 2: アイコン生成

必要なサイズ:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**ツール:**
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- または手動でリサイズ

**コマンド:**
```bash
npx pwa-asset-generator app/icon.svg public/icons \
  --background "#1a365d" \
  --splash-only false \
  --icon-only true
```

### Step 3: Service Worker実装

**ファイル:** `public/sw.js`

```javascript
const CACHE_NAME = 'books-fan-v1';
const urlsToCache = [
  '/',
  '/books',
  '/reading',
  '/profile',
  '/offline',
];

// インストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// アクティベーション
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチ（キャッシュ優先戦略）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // APIリクエストはキャッシュしない
        if (event.request.url.includes('/api/')) {
          return response;
        }

        // 静的アセットをキャッシュ
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // オフライン時のフォールバック
      return caches.match('/offline');
    })
  );
});

// プッシュ通知
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### Step 4: Service Worker登録

**ファイル:** `app/layout.tsx`に追加

```typescript
// app/layout.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}, []);
```

### Step 5: HTMLヘッダーにメタタグ追加

**ファイル:** `app/layout.tsx`

```tsx
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#1a365d" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Books Fan" />

  {/* Apple Touch Icons */}
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

  {/* Splash Screens (iOS) */}
  <link rel="apple-touch-startup-image" href="/splash/iphone5.png" media="(device-width: 320px) and (device-height: 568px)" />
</head>
```

### Step 6: オフラインページ作成

**ファイル:** `app/offline/page.tsx`

```tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          オフラインです
        </h1>
        <p className="text-gray-600 mb-6">
          インターネット接続を確認してください
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
```

### Step 7: インストールプロンプト実装

**ファイル:** `components/InstallPrompt.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">📱 アプリをインストール</h3>
          <p className="text-sm text-purple-100">
            ホーム画面に追加して快適に読書管理！
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2 text-white/80 hover:text-white"
          >
            後で
          </button>
          <button
            onClick={handleInstall}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
          >
            インストール
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 8: プッシュ通知実装（オプション）

**バックエンド:** Web Push通知設定

```typescript
// server/trpc/routers/notification.ts
import webpush from 'web-push';

// VAPID鍵生成（初回のみ）
// npx web-push generate-vapid-keys

webpush.setVapidDetails(
  'mailto:support@books-fan.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const notificationRouter = router({
  subscribe: publicProcedure
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      // プッシュ通知サブスクリプションをDBに保存
      await prisma.pushSubscription.create({
        data: {
          userId: ctx.session.user.id,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
        },
      });
    }),
});
```

**フロントエンド:** プッシュ通知購読

```typescript
// components/NotificationPermission.tsx
const subscribeToPush = async () => {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  // サーバーに保存
  await fetch('/api/trpc/notification.subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
};
```

---

## Phase 2: TWA（Trusted Web Activity）でPlayストア配布

### 概要
PWAをネイティブアプリとしてGoogle Playストアで配布できます。

### 所要時間
1週間（Phase 1完了後）

### 実装ステップ

#### Step 1: Bubblewrapのインストール

```bash
npm install -g @bubblewrap/cli
```

#### Step 2: TWAプロジェクト初期化

```bash
bubblewrap init --manifest https://books-fan.com/manifest.json
```

質問に回答:
- Domain: books-fan.com
- App name: Books Fan
- Package name: com.booksfan.app
- Icon: 自動生成

#### Step 3: Digital Asset Links設定

**ファイル:** `public/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.booksfan.app",
    "sha256_cert_fingerprints": [
      "SHA256フィンガープリント"
    ]
  }
}]
```

#### Step 4: APKビルド

```bash
bubblewrap build
```

#### Step 5: Play Console登録

1. [Google Play Console](https://play.google.com/console)にアクセス
2. 新しいアプリを作成
3. APK/AABをアップロード
4. ストアリスティング作成
   - タイトル: Books Fan
   - 説明: 本好きのためのレビュー&推薦プラットフォーム
   - カテゴリ: 書籍
   - スクリーンショット準備（最低2枚）
5. 審査申請

---

## Phase 3: React Native実装（将来的な選択肢）

### いつ検討すべきか

以下の場合にReact Nativeを検討:
- カメラ、位置情報など高度なネイティブ機能が必要
- オフラインファーストアプリにしたい
- よりスムーズなアニメーション
- アプリストアでの評価向上

### 技術スタック

- **React Native**: フレームワーク
- **Expo**: 開発環境
- **React Navigation**: ナビゲーション
- **React Query**: データフェッチング
- **AsyncStorage**: ローカルストレージ

### 開発期間

2-3ヶ月（フルタイム）

---

## 必要なリソース

### Phase 1（PWA）
- [ ] アイコン各サイズ生成
- [ ] スクリーンショット作成
- [ ] Service Worker実装
- [ ] オフライン対応
- [ ] テスト（Android Chrome）

### Phase 2（TWA）
- [ ] Google Play Developer アカウント（$25 一回のみ）
- [ ] プライバシーポリシーページ
- [ ] 利用規約ページ
- [ ] ストア用スクリーンショット（1080x1920）
- [ ] フィーチャーグラフィック（1024x500）

### Phase 3（React Native）
- [ ] React Native開発経験
- [ ] Expo開発環境
- [ ] iOS Developer アカウント（iOS対応の場合）

---

## コスト見積もり

### Phase 1（PWA）
- **開発コスト**: ¥0（自社開発）
- **運用コスト**: ¥0
- **合計**: ¥0

### Phase 2（TWA + Play Store）
- **Google Play Developer登録**: $25（¥3,500）一回のみ
- **開発コスト**: ¥0（自社開発）
- **合計**: ¥3,500

### Phase 3（React Native）
- **開発コスト**: ¥500,000 - ¥1,000,000（外注の場合）
- **iOS対応**: +¥13,000/年（Apple Developer）
- **合計**: ¥500,000+

---

## 推奨スケジュール

### Week 1-2: PWA実装
- Day 1-2: Manifest & アイコン作成
- Day 3-5: Service Worker実装
- Day 6-7: オフライン対応
- Day 8-10: プッシュ通知（オプション）
- Day 11-14: テスト & 修正

### Week 3: TWA実装
- Day 15-16: Bubblewrap設定
- Day 17-18: Digital Asset Links
- Day 19-20: APKビルド & テスト
- Day 21: Play Console登録 & 審査申請

### Week 4: リリース
- 審査待ち & 修正対応
- リリース後のモニタリング

---

## 成功基準

### Phase 1（PWA）
- ✅ Lighthouse PWAスコア90+
- ✅ Service Workerが正常に動作
- ✅ オフラインで基本機能が使える
- ✅ ホーム画面に追加可能
- ✅ プッシュ通知が届く

### Phase 2（TWA）
- ✅ Google Playストアで公開
- ✅ インストール数100+/月
- ✅ 評価4.0+
- ✅ クラッシュ率1%未満

---

## 参考リンク

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
- [Google Play Console](https://play.google.com/console)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 次のステップ

1. ✅ このドキュメントを確認
2. ⬜ Phase 1の実装を開始するか決定
3. ⬜ アイコンとスクリーンショットを準備
4. ⬜ 実装開始

実装のサポートが必要な場合はお知らせください！
