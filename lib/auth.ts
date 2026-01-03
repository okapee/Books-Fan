import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile openid",
          bot_prompt: "normal",
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // LINEログインの場合、トークン情報を保存
      if (account?.provider === "line" && account.access_token) {
        try {
          // ユーザーが存在するか確認してから更新
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                lineUserId: account.providerAccountId,
                lineAccessToken: account.access_token,
                lineRefreshToken: account.refresh_token,
                lineTokenExpiresAt: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null,
              },
            });
          }
        } catch (error) {
          console.error("Error updating LINE user info:", error);
          // エラーが発生してもログインは継続させる
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // データベースからユーザー情報を取得
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            membershipType: true,
            subscriptionStatus: true,
            aiUsageCount: true,
            aiUsageResetDate: true,
            lineUserId: true,
            lineNotificationsEnabled: true,
          },
        });

        if (dbUser) {
          session.user.email = dbUser.email || session.user.email;
          session.user.name = dbUser.name || session.user.name;
          session.user.image = dbUser.image || session.user.image;
          session.user.membershipType = dbUser.membershipType;
          session.user.subscriptionStatus = dbUser.subscriptionStatus;
          session.user.aiUsageCount = dbUser.aiUsageCount;
          session.user.aiUsageResetDate = dbUser.aiUsageResetDate;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
