import { MembershipType, SubscriptionStatus } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      membershipType: MembershipType;
      subscriptionStatus: SubscriptionStatus;
      aiUsageCount: number;
      aiUsageResetDate: Date;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    membershipType: MembershipType;
    subscriptionStatus: SubscriptionStatus;
    aiUsageCount: number;
    aiUsageResetDate: Date;
  }
}
