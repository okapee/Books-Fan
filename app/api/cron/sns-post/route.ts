/**
 * SNS自動投稿 Cron API
 * 毎日1回実行され、最新のレビューを X に投稿する
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postTweet, isTwitterConfigured } from "@/server/services/twitter";
import { generateTweetText, validateTweetLength } from "@/server/services/snsPost";

export async function GET(request: NextRequest) {
  try {
    // CRON_SECRETで認証（開発環境ではスキップ可能）
    const authHeader = request.headers.get("authorization");
    const isDevMode = process.env.NODE_ENV === "development";
    const skipAuth = isDevMode && request.nextUrl.searchParams.get("skipAuth") === "true";

    if (!skipAuth && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // X API の設定確認
    if (!isTwitterConfigured()) {
      return NextResponse.json(
        { error: "X API is not configured" },
        { status: 500 }
      );
    }

    // すでに投稿済みの本IDを取得
    const postedBookIds = await prisma.sNSPost.findMany({
      where: {
        platform: "X",
        status: "POSTED",
      },
      select: {
        bookId: true,
      },
    });
    const postedBookIdSet = new Set(postedBookIds.map((p) => p.bookId));

    // 最新の公開レビューで、まだ投稿されていない本を取得
    const targetReview = await prisma.review.findFirst({
      where: {
        isPublic: true,
        book: {
          id: {
            notIn: Array.from(postedBookIdSet),
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        book: true,
      },
    });

    if (!targetReview) {
      return NextResponse.json({
        success: true,
        message: "No new reviews to post",
        posted: false,
      });
    }

    // 投稿テキストを生成
    const tweetText = generateTweetText(
      {
        id: targetReview.book.id,
        title: targetReview.book.title,
        author: targetReview.book.author,
        isbn: targetReview.book.isbn,
        googleBooksId: targetReview.book.googleBooksId,
        averageRating: targetReview.book.averageRating,
      },
      {
        content: targetReview.content,
        rating: targetReview.rating,
      }
    );

    // 文字数チェック
    const validation = validateTweetLength(tweetText);
    if (!validation.isValid) {
      console.warn(
        `Tweet text exceeds limit: ${validation.length}/${validation.maxLength}`
      );
    }

    // SNSPostレコードを作成（PENDING状態）
    const snsPost = await prisma.sNSPost.create({
      data: {
        platform: "X",
        bookId: targetReview.book.id,
        reviewId: targetReview.id,
        content: tweetText,
        status: "PENDING",
      },
    });

    // Xに投稿
    const result = await postTweet(tweetText);

    if (result.success) {
      // 成功時：ステータスを更新
      await prisma.sNSPost.update({
        where: { id: snsPost.id },
        data: {
          status: "POSTED",
          externalId: result.tweetId,
          postedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Tweet posted successfully",
        posted: true,
        tweetId: result.tweetId,
        book: {
          id: targetReview.book.id,
          title: targetReview.book.title,
        },
      });
    } else {
      // 失敗時：エラーメッセージを記録
      await prisma.sNSPost.update({
        where: { id: snsPost.id },
        data: {
          status: "FAILED",
          errorMessage: result.error,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          book: {
            id: targetReview.book.id,
            title: targetReview.book.title,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in SNS post cron:", error);

    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
