import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// プレミアムプランの価格ID（Stripeダッシュボードで作成）
export const PREMIUM_PLAN_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || "";

// プランの金額（表示用）
export const PREMIUM_PLAN_AMOUNT = 980; // 980円/月
