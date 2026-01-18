/**
 * X OAuth 2.0 コールバックエンドポイント
 * 認証完了後にトークンを保存
 */

import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin?error=x_auth_${error}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin?error=x_auth_missing_params`
    );
  }

  // Cookieからstateとcode_verifierを取得
  const storedState = request.cookies.get("x_oauth_state")?.value;
  const codeVerifier = request.cookies.get("x_oauth_code_verifier")?.value;

  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin?error=x_auth_state_mismatch`
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin?error=x_auth_no_verifier`
    );
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin?error=x_auth_no_credentials`
    );
  }

  try {
    const client = new TwitterApi({ clientId, clientSecret });
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/x/callback`;

    // アクセストークンを取得
    const {
      accessToken,
      refreshToken,
      expiresIn,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackUrl,
    });

    if (!refreshToken) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/admin?error=x_auth_no_refresh_token`
      );
    }

    // トークンをデータベースに保存
    await prisma.systemSetting.upsert({
      where: { key: "x_oauth2_tokens" },
      update: {
        value: JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + (expiresIn || 7200) * 1000,
        }),
      },
      create: {
        key: "x_oauth2_tokens",
        value: JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + (expiresIn || 7200) * 1000,
        }),
      },
    });

    // Cookieをクリア
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin?success=x_auth_connected`
    );
    response.cookies.delete("x_oauth_state");
    response.cookies.delete("x_oauth_code_verifier");

    return response;
  } catch (err) {
    console.error("X OAuth callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin?error=x_auth_failed`
    );
  }
}
