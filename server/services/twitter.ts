/**
 * X (Twitter) API サービス
 * 自動投稿機能のためのX API連携
 */

import { TwitterApi } from "twitter-api-v2";

// X API クライアントの初期化
function getTwitterClient(): TwitterApi | null {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.error("X API credentials are not configured");
    return null;
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessTokenSecret,
  });
}

/**
 * ツイートを投稿する
 * @param text 投稿するテキスト
 * @returns 投稿結果（成功時はtweetId、失敗時はnull）
 */
export async function postTweet(text: string): Promise<{
  success: boolean;
  tweetId?: string;
  error?: string;
}> {
  const client = getTwitterClient();

  if (!client) {
    return {
      success: false,
      error: "X API credentials are not configured",
    };
  }

  try {
    // X API v2 でツイートを投稿
    const result = await client.v2.tweet(text);

    return {
      success: true,
      tweetId: result.data.id,
    };
  } catch (error: unknown) {
    console.error("Failed to post tweet:", error);

    let errorMessage = "Unknown error";

    // twitter-api-v2 のエラー詳細を取得
    if (error && typeof error === "object") {
      const err = error as Record<string, unknown>;

      // APIエラーの詳細を取得
      if (err.data && typeof err.data === "object") {
        const data = err.data as Record<string, unknown>;
        console.error("X API Error details:", JSON.stringify(data, null, 2));

        if (data.detail) {
          errorMessage = String(data.detail);
        } else if (data.title) {
          errorMessage = String(data.title);
        }
      }

      if (err.message) {
        errorMessage = String(err.message);
      }

      // エラーコードも記録
      if (err.code) {
        errorMessage += ` (code: ${err.code})`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * X API の認証情報が設定されているかチェック
 */
export function isTwitterConfigured(): boolean {
  return !!(
    process.env.X_API_KEY &&
    process.env.X_API_SECRET &&
    process.env.X_ACCESS_TOKEN &&
    process.env.X_ACCESS_TOKEN_SECRET
  );
}
