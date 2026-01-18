/**
 * X API テストスクリプト
 * 実行: npx ts-node scripts/test-twitter.ts
 */

import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";

// .envファイルを読み込み
dotenv.config();

async function testTwitterApi() {
  console.log("=== X API 接続テスト ===\n");

  // 環境変数の確認
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  console.log("環境変数チェック:");
  console.log(`  X_API_KEY: ${apiKey ? `設定済み (${apiKey.substring(0, 5)}...)` : "未設定"}`);
  console.log(`  X_API_SECRET: ${apiSecret ? `設定済み (${apiSecret.substring(0, 5)}...)` : "未設定"}`);
  console.log(`  X_ACCESS_TOKEN: ${accessToken ? `設定済み (${accessToken.substring(0, 10)}...)` : "未設定"}`);
  console.log(`  X_ACCESS_TOKEN_SECRET: ${accessTokenSecret ? `設定済み (${accessTokenSecret.substring(0, 5)}...)` : "未設定"}`);
  console.log("");

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.error("❌ 環境変数が不足しています");
    return;
  }

  // Twitter クライアント作成（readWriteモードで）
  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessTokenSecret,
  }).readWrite;

  // 1. まず認証ユーザー情報を取得（読み取りテスト）
  console.log("1. 認証ユーザー情報を取得中...");
  try {
    const me = await client.v2.me();
    console.log(`✅ 認証成功: @${me.data.username} (${me.data.name})`);
    console.log("");
  } catch (error: unknown) {
    console.error("❌ 認証エラー:");
    if (error && typeof error === "object") {
      const err = error as Record<string, unknown>;
      console.error(`  Code: ${err.code}`);
      if (err.data) {
        console.error(`  Data: ${JSON.stringify(err.data, null, 2)}`);
      }
      if (err.message) {
        console.error(`  Message: ${err.message}`);
      }
    }
    return;
  }

  // 2. ツイート投稿テスト
  console.log("2. ツイート投稿テスト...");
  const testMessage = `Books Fan テスト投稿 ${new Date().toISOString()}`;
  console.log(`   投稿内容: "${testMessage}"`);

  try {
    const result = await client.v2.tweet(testMessage);
    console.log(`✅ 投稿成功! Tweet ID: ${result.data.id}`);
    console.log(`   URL: https://twitter.com/i/status/${result.data.id}`);

    // 投稿したツイートを削除（テスト後のクリーンアップ）
    console.log("\n3. テストツイートを削除中...");
    await client.v2.deleteTweet(result.data.id);
    console.log("✅ 削除完了");

  } catch (error: unknown) {
    console.error("❌ 投稿エラー:");
    if (error && typeof error === "object") {
      const err = error as Record<string, unknown>;
      console.error(`  Code: ${err.code}`);
      if (err.data) {
        console.error(`  Data: ${JSON.stringify(err.data, null, 2)}`);
      }
      if (err.message) {
        console.error(`  Message: ${err.message}`);
      }

      // 403エラーの場合のアドバイス
      if (err.code === 403) {
        console.log("\n=== 403エラーの解決方法 ===");
        console.log("1. X Developer Portal でアプリの権限を確認:");
        console.log("   - User authentication settings → App permissions");
        console.log("   - 「Read and write」が選択されているか確認");
        console.log("");
        console.log("2. 権限変更後は Access Token を再生成:");
        console.log("   - Keys and tokens → Access Token and Secret → Regenerate");
        console.log("");
        console.log("3. 新しいトークンを .env に反映:");
        console.log("   - X_ACCESS_TOKEN と X_ACCESS_TOKEN_SECRET を更新");
      }
    }
  }
}

testTwitterApi().catch(console.error);
