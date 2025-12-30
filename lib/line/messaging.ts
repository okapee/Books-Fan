import { prisma } from "@/lib/prisma";

const LINE_MESSAGING_API_URL = "https://api.line.me/v2/bot/message/push";

interface LineMessage {
  type: "text" | "flex";
  text?: string;
  contents?: any;
}

/**
 * LINEメッセージを送信する
 */
export async function sendLineMessage(
  userId: string,
  messages: LineMessage[]
): Promise<boolean> {
  try {
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lineUserId: true,
        lineAccessToken: true,
        lineNotificationsEnabled: true,
      },
    });

    if (!user?.lineUserId || !user?.lineAccessToken) {
      console.log(`User ${userId} does not have LINE connected`);
      return false;
    }

    if (!user.lineNotificationsEnabled) {
      console.log(`User ${userId} has disabled LINE notifications`);
      return false;
    }

    // LINEにメッセージを送信
    const response = await fetch(LINE_MESSAGING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: user.lineUserId,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to send LINE message: ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending LINE message:", error);
    return false;
  }
}

/**
 * おすすめの本をLINEで送信する
 */
export async function sendWeeklyBookRecommendations(
  userId: string,
  books: Array<{
    id: string;
    title: string;
    author: string;
    coverImageUrl?: string | null;
    description?: string | null;
  }>
): Promise<boolean> {
  if (books.length === 0) {
    return false;
  }

  // Flex Messageを作成
  const flexMessage = {
    type: "flex" as const,
    altText: "今週のおすすめの本",
    contents: {
      type: "carousel",
      contents: books.slice(0, 10).map((book) => ({
        type: "bubble",
        hero: book.coverImageUrl
          ? {
              type: "image",
              url: book.coverImageUrl,
              size: "full",
              aspectRatio: "3:4",
              aspectMode: "cover",
            }
          : undefined,
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: book.title,
              weight: "bold",
              size: "lg",
              wrap: true,
            },
            {
              type: "text",
              text: book.author,
              size: "sm",
              color: "#999999",
              margin: "md",
              wrap: true,
            },
            book.description
              ? {
                  type: "text",
                  text: book.description.slice(0, 100) + "...",
                  size: "xs",
                  color: "#666666",
                  margin: "md",
                  wrap: true,
                }
              : undefined,
          ].filter(Boolean),
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              action: {
                type: "uri",
                label: "詳細を見る",
                uri: `${process.env.NEXTAUTH_URL}/books/${book.id}`,
              },
            },
          ],
        },
      })),
    },
  };

  return await sendLineMessage(userId, [flexMessage]);
}
