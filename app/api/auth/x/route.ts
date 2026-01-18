/**
 * X OAuth 2.0 認証開始エンドポイント
 * 管理者がX連携を設定するために使用
 */

import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // 管理者のみアクセス可能
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "X OAuth 2.0 credentials are not configured" },
      { status: 500 }
    );
  }

  const client = new TwitterApi({ clientId, clientSecret });

  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/x/callback`;

  // OAuth 2.0 認証URLを生成
  const { url, state, codeVerifier } = client.generateOAuth2AuthLink(callbackUrl, {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  });

  // stateとcodeVerifierをcookieに保存（コールバックで使用）
  const response = NextResponse.redirect(url);
  response.cookies.set("x_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10分
    path: "/",
  });
  response.cookies.set("x_oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10分
    path: "/",
  });

  return response;
}
