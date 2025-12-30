/**
 * Stripe法人向けサブスクリプションサービス
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// 法人プランの価格ID（Stripeダッシュボードで作成したもの）
const CORPORATE_MONTHLY_PRICE_ID =
  process.env.STRIPE_CORPORATE_MONTHLY_PRICE_ID || "";
const CORPORATE_ANNUAL_PRICE_ID =
  process.env.STRIPE_CORPORATE_ANNUAL_PRICE_ID || "";

/**
 * 企業向けチェックアウトセッションを作成
 */
export async function createCorporateCheckoutSession(
  companyId: string,
  companyName: string,
  customerEmail: string,
  contractType: "MONTHLY" | "ANNUAL",
  maxUsers: number = 100
): Promise<string> {
  // 契約タイプに応じた価格IDを選択
  const priceId =
    contractType === "MONTHLY"
      ? CORPORATE_MONTHLY_PRICE_ID
      : CORPORATE_ANNUAL_PRICE_ID;

  if (!priceId) {
    throw new Error(
      `Stripe price ID not configured for ${contractType} contract`
    );
  }

  // チェックアウトセッションを作成
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${APP_URL}/company/dashboard?success=true`,
    cancel_url: `${APP_URL}/company/dashboard?canceled=true`,
    customer_email: customerEmail,
    client_reference_id: companyId,
    metadata: {
      companyId,
      companyName,
      contractType,
      maxUsers: maxUsers.toString(),
      plan: "CORPORATE",
    },
    subscription_data: {
      metadata: {
        companyId,
        companyName,
        contractType,
        maxUsers: maxUsers.toString(),
      },
    },
  });

  return session.url || "";
}

/**
 * 企業向けカスタマーポータルセッションを作成
 */
export async function createCorporatePortalSession(
  stripeCustomerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${APP_URL}/company/dashboard`,
  });

  return session.url;
}

/**
 * サブスクリプション情報を取得
 */
export async function getCorporateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Failed to retrieve subscription:", error);
    return null;
  }
}

/**
 * サブスクリプションをキャンセル
 */
export async function cancelCorporateSubscription(
  subscriptionId: string
): Promise<boolean> {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return false;
  }
}

/**
 * Webhookイベントを処理
 */
export async function handleCorporateWebhook(
  event: Stripe.Event
): Promise<{
  companyId?: string;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  currentPeriodEnd?: Date;
}> {
  const result: any = {};

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      result.companyId = session.client_reference_id || session.metadata?.companyId;
      result.customerId = session.customer as string;
      result.subscriptionId = session.subscription as string;
      result.status = "ACTIVE";
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      result.companyId = subscription.metadata.companyId;
      result.customerId = subscription.customer as string;
      result.subscriptionId = subscription.id;
      result.status = mapStripeStatus(subscription.status);
      result.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      result.companyId = subscription.metadata.companyId;
      result.subscriptionId = subscription.id;
      result.status = "CANCELED";
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      result.customerId = invoice.customer as string;
      result.subscriptionId = invoice.subscription as string;
      result.status = "PAST_DUE";
      break;
    }
  }

  return result;
}

/**
 * Stripeのステータスをアプリのステータスにマッピング
 */
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "ACTIVE" | "CANCELED" | "PAST_DUE" | "UNPAID" | "NONE" {
  switch (stripeStatus) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "past_due":
      return "PAST_DUE";
    case "unpaid":
      return "UNPAID";
    default:
      return "NONE";
  }
}

/**
 * 使用量ベースの価格を作成（将来の拡張用）
 */
export async function createUsageBasedPrice(
  productId: string,
  unitAmount: number,
  currency: string = "jpy"
): Promise<string> {
  const price = await stripe.prices.create({
    product: productId,
    currency,
    recurring: {
      interval: "month",
      usage_type: "metered",
    },
    billing_scheme: "per_unit",
    unit_amount: unitAmount,
  });

  return price.id;
}

/**
 * 使用量を報告（将来の拡張用）
 */
export async function reportUsage(
  subscriptionItemId: string,
  quantity: number,
  timestamp?: number
): Promise<boolean> {
  try {
    await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      action: "increment",
    });
    return true;
  } catch (error) {
    console.error("Failed to report usage:", error);
    return false;
  }
}
