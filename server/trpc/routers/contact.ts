import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendContactEmail } from "@/server/services/email";

export const contactRouter = router({
  // お問い合わせを送信
  send: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "お名前を入力してください"),
        email: z.string().email("有効なメールアドレスを入力してください"),
        category: z.enum(["general", "technical", "billing", "feature", "other"]),
        message: z.string().min(10, "お問い合わせ内容は10文字以上入力してください"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // メールを送信
        const success = await sendContactEmail(
          input.name,
          input.email,
          input.category,
          input.message
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "メールの送信に失敗しました",
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Contact form error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "お問い合わせの送信に失敗しました",
        });
      }
    }),
});
