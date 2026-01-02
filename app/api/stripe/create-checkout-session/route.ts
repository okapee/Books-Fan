import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PREMIUM_PLAN_PRICE_ID } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("[Stripe Checkout] No user session found");
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // リクエストボディからプロモーションコードを取得
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const { promotionCode } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // すでにプレミアム会員の場合
    if (user.membershipType === "PREMIUM" && user.subscriptionStatus === "ACTIVE") {
      return NextResponse.json(
        { error: "すでにプレミアム会員です" },
        { status: 400 }
      );
    }

    // Stripe顧客を作成または取得
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // DBに顧客IDを保存
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // プロモーションコードの処理
    let discounts = undefined;
    let promotionCodeNotFound = false;

    if (promotionCode && typeof promotionCode === "string") {
      try {
        // プロモーションコードをコード文字列から検索
        const promotionCodes = await stripe.promotionCodes.list({
          code: promotionCode,
          active: true,
          limit: 1,
        });

        if (promotionCodes.data.length > 0) {
          discounts = [{ promotion_code: promotionCodes.data[0].id }];
          console.log(`[Stripe Checkout] Promotion code found and will be applied: ${promotionCode}`);
        } else {
          console.warn(`[Stripe Checkout] Promotion code not found: ${promotionCode}`);
          promotionCodeNotFound = true;
          // プロモーションコードが見つからない場合はエラーを返す
          return NextResponse.json(
            {
              error: `プロモーションコード「${promotionCode}」が見つかりませんでした。コードを確認してください。`,
              code: "PROMOTION_CODE_NOT_FOUND"
            },
            { status: 400 }
          );
        }
      } catch (promoError: any) {
        console.error("[Stripe Checkout] Error fetching promotion code:", promoError);
        return NextResponse.json(
          {
            error: "プロモーションコードの確認中にエラーが発生しました。もう一度お試しください。",
            code: "PROMOTION_CODE_ERROR"
          },
          { status: 500 }
        );
      }
    }

    // Checkout Sessionを作成
    const checkoutSessionParams: any = {
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PREMIUM_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/upgrade?canceled=true`,
      metadata: {
        userId: user.id,
      },
    };

    // プロモーションコードの処理
    // ユーザーがコードを入力した場合は自動適用、未入力の場合は手動入力を許可
    if (discounts) {
      // プロモーションコードが見つかった場合は自動適用
      checkoutSessionParams.discounts = discounts;
    } else {
      // コードが入力されていない場合は、Stripeページで手動入力を許可
      checkoutSessionParams.allow_promotion_codes = true;
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: any) {
    console.error("[Stripe Checkout] Detailed error:", {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      stack: error?.stack,
    });

    // より具体的なエラーメッセージを返す
    const errorMessage = error?.message || "チェックアウトセッションの作成に失敗しました";

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
