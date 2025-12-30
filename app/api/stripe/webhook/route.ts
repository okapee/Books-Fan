import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe signature missing" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.error("No subscription ID in checkout session");
    return;
  }

  // サブスクリプション情報を取得
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      membershipType: "PREMIUM",
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: "ACTIVE",
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error(`No user found for subscription ${subscription.id}`);
    return;
  }

  console.log(`Subscription update received for user ${user.id}:`, {
    status: subscription.status,
    currentStatus: user.subscriptionStatus,
    currentMembership: user.membershipType,
  });

  let subscriptionStatus: "ACTIVE" | "CANCELED" | "PAST_DUE" | "UNPAID" | "NONE" = "NONE";
  // CORPORATEユーザーの場合は個人向けStripe webhookの対象外
  let membershipType: "PREMIUM" | "FREE" =
    user.membershipType === "CORPORATE" ? "FREE" : user.membershipType;

  switch (subscription.status) {
    case "active":
      subscriptionStatus = "ACTIVE";
      membershipType = "PREMIUM";
      break;
    case "trialing":
      // トライアル期間中もプレミアム機能を提供
      subscriptionStatus = "ACTIVE";
      membershipType = "PREMIUM";
      break;
    case "past_due":
      // 支払い遅延中だが、まだプレミアム機能を維持
      subscriptionStatus = "PAST_DUE";
      membershipType = "PREMIUM";
      break;
    case "canceled":
      subscriptionStatus = "CANCELED";
      membershipType = "FREE";
      break;
    case "unpaid":
      // 未払いで終了
      subscriptionStatus = "UNPAID";
      membershipType = "FREE";
      break;
    case "incomplete":
    case "incomplete_expired":
      // 不完全な状態は既存のメンバーシップを維持
      // 新規サブスクリプションの場合のみ影響
      subscriptionStatus = "NONE";
      // 既存のPREMIUMユーザーはそのまま、FREEユーザーもそのまま
      break;
    default:
      console.warn(`Unknown subscription status: ${subscription.status}`);
      subscriptionStatus = "NONE";
      break;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      membershipType,
      subscriptionStatus,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription updated for user ${user.id}:`, {
    newStatus: subscription.status,
    membershipType,
    subscriptionStatus,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error(`No user found for subscription ${subscription.id}`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      membershipType: "FREE",
      subscriptionStatus: "CANCELED",
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    },
  });

  console.log(`Subscription deleted for user ${user.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!user) {
    console.error(`No user found for subscription ${subscriptionId}`);
    return;
  }

  console.log(`Payment succeeded for user ${user.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!user) {
    console.error(`No user found for subscription ${subscriptionId}`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "PAST_DUE",
    },
  });

  console.log(`Payment failed for user ${user.id}`);
}
