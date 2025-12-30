import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { handleCorporateWebhook } from "@/server/services/stripe-corporate";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_CORPORATE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Webhookイベントを検証
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log("Received Stripe webhook event:", event.type);

    // イベントを処理
    const result = await handleCorporateWebhook(event);

    // データベースを更新
    if (result.companyId) {
      const updateData: any = {};

      if (result.customerId) {
        updateData.stripeCustomerId = result.customerId;
      }

      if (result.subscriptionId) {
        updateData.stripeSubscriptionId = result.subscriptionId;
      }

      if (result.status) {
        updateData.subscriptionStatus = result.status;
      }

      if (result.currentPeriodEnd) {
        updateData.currentPeriodEnd = result.currentPeriodEnd;
      }

      // 企業情報を更新
      await prisma.company.update({
        where: { id: result.companyId },
        data: updateData,
      });

      console.log("Updated company:", result.companyId, updateData);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }
}
