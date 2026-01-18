/**
 * X (Twitter) API サービス
 * 自動投稿機能のためのX API連携
 * OAuth 2.0 User Context を使用
 */

import { TwitterApi } from "twitter-api-v2";
import { prisma } from "@/lib/prisma";

// OAuth 2.0 クライアントの初期化
function getOAuth2Client(): TwitterApi | null {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("X OAuth 2.0 credentials are not configured");
    return null;
  }

  return new TwitterApi({
    clientId,
    clientSecret,
  });
}

// アクセストークンを使用したクライアント
function getTwitterClientWithToken(accessToken: string): TwitterApi {
  return new TwitterApi(accessToken);
}

// データベースからOAuth2トークンを取得
async function getStoredTokens(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "x_oauth2_tokens" },
  });

  if (!setting?.value) {
    return null;
  }

  try {
    return JSON.parse(setting.value);
  } catch {
    return null;
  }
}

// トークンをデータベースに保存
async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: "x_oauth2_tokens" },
    update: { value: JSON.stringify({ accessToken, refreshToken }) },
    create: { key: "x_oauth2_tokens", value: JSON.stringify({ accessToken, refreshToken }) },
  });
}

// トークンをリフレッシュ
async function refreshAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  if (!tokens?.refreshToken) {
    console.error("No refresh token found");
    return null;
  }

  const client = getOAuth2Client();
  if (!client) {
    return null;
  }

  try {
    const { accessToken, refreshToken } = await client.refreshOAuth2Token(
      tokens.refreshToken
    );

    await saveTokens(accessToken, refreshToken || tokens.refreshToken);
    return accessToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}

// X API クライアントを取得（トークンリフレッシュ対応）
async function getTwitterClient(): Promise<TwitterApi | null> {
  // まず保存されたトークンを試す
  const tokens = await getStoredTokens();

  if (tokens?.accessToken) {
    return getTwitterClientWithToken(tokens.accessToken);
  }

  // トークンがない場合は、OAuth 1.0a にフォールバック
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (apiKey && apiSecret && accessToken && accessTokenSecret) {
    return new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    }).readWrite;
  }

  console.error("No valid X API credentials found");
  return null;
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
  let client = await getTwitterClient();

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
    // 401エラー（トークン期限切れ）の場合はリフレッシュを試行
    if (error && typeof error === "object" && (error as Record<string, unknown>).code === 401) {
      console.log("Access token expired, attempting refresh...");
      const newToken = await refreshAccessToken();
      if (newToken) {
        client = getTwitterClientWithToken(newToken);
        try {
          const result = await client.v2.tweet(text);
          return {
            success: true,
            tweetId: result.data.id,
          };
        } catch (retryError) {
          console.error("Failed to post tweet after refresh:", retryError);
        }
      }
    }
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
