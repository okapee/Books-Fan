/**
 * メール送信サービス
 * Resend APIを使用してメールを送信します
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@booksfan.app";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * メールを送信（汎用）
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email sending is disabled.");
    // 開発環境ではコンソールにログ出力
    console.log("Email would be sent:", {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });
    return true; // 開発環境では成功扱い
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * 企業招待メールを送信
 */
export async function sendCompanyInvitationEmail(
  email: string,
  companyName: string,
  inviterName: string,
  token: string,
  role: string
): Promise<boolean> {
  const invitationUrl = `${APP_URL}/company/invitation?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>企業への招待</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- ヘッダー -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📨 企業への招待</h1>
            </td>
          </tr>

          <!-- メインコンテンツ -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                こんにちは、
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                <strong>${inviterName}</strong>さんから、<strong>${companyName}</strong>の法人アカウントに招待されました。
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">招待された役割:</p>
                <p style="margin: 0; font-size: 16px; color: #333333; font-weight: bold;">
                  ${role === "ADMIN" ? "管理者" : "メンバー"}
                </p>
              </div>

              <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                招待を受諾すると、以下の機能をご利用いただけます:
              </p>

              <ul style="margin: 0 0 20px 20px; padding: 0; color: #333333; line-height: 1.8;">
                <li>企業内でのコンテンツ共有</li>
                <li>AI要約機能（企業全体で月1000回）</li>
                <li>企業メンバーとのコラボレーション</li>
                <li>使用状況レポートの確認</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
                  招待を受諾する
                </a>
              </div>

              <p style="margin: 20px 0 0; font-size: 14px; color: #999999; line-height: 1.6;">
                このリンクは7日間有効です。招待を受諾しない場合は、このメールを無視してください。
              </p>
            </td>
          </tr>

          <!-- フッター -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                このメールは Books Fan から送信されました<br>
                <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">${APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
${companyName}への招待

${inviterName}さんから、${companyName}の法人アカウントに招待されました。

招待された役割: ${role === "ADMIN" ? "管理者" : "メンバー"}

招待を受諾するには、以下のリンクをクリックしてください:
${invitationUrl}

このリンクは7日間有効です。

Books Fan
${APP_URL}
  `;

  return sendEmail({
    to: email,
    subject: `【Books Fan】${companyName}への招待`,
    html,
    text,
  });
}

/**
 * レビューいいね通知メールを送信
 */
export async function sendReviewLikeNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  likerName: string,
  bookTitle: string,
  bookGoogleId: string
): Promise<boolean> {
  const bookUrl = `${APP_URL}/books/${bookGoogleId}`;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>レビューにいいねされました</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">❤️</div>
              <h1 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: bold;">レビューにいいねされました</h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                こんにちは、${recipientName}さん
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                <strong>${likerName}</strong>さんが、あなたの「${bookTitle}」のレビューにいいねしました。
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${bookUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  レビューを見る
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                このメールは Books Fan から送信されました
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
レビューにいいねされました

こんにちは、${recipientName}さん

${likerName}さんが、あなたの「${bookTitle}」のレビューにいいねしました。

レビューを見る: ${bookUrl}

Books Fan
${APP_URL}
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `【Books Fan】${likerName}さんがあなたのレビューにいいねしました`,
    html,
    text,
  });
}

/**
 * レビューコメント通知メールを送信
 */
export async function sendReviewCommentNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  commenterName: string,
  comment: string,
  bookTitle: string,
  bookGoogleId: string
): Promise<boolean> {
  const bookUrl = `${APP_URL}/books/${bookGoogleId}`;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>レビューにコメントされました</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">💬</div>
              <h1 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: bold;">レビューにコメントされました</h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                こんにちは、${recipientName}さん
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                <strong>${commenterName}</strong>さんが、あなたの「${bookTitle}」のレビューにコメントしました。
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; text-align: left;">
                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                  ${comment.length > 150 ? comment.substring(0, 150) + "..." : comment}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${bookUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  コメントを見る
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                このメールは Books Fan から送信されました
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
レビューにコメントされました

こんにちは、${recipientName}さん

${commenterName}さんが、あなたの「${bookTitle}」のレビューにコメントしました。

コメント:
${comment}

コメントを見る: ${bookUrl}

Books Fan
${APP_URL}
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `【Books Fan】${commenterName}さんがあなたのレビューにコメントしました`,
    html,
    text,
  });
}

/**
 * フォロー通知メールを送信
 */
export async function sendFollowNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  followerName: string,
  followerId: string
): Promise<boolean> {
  const profileUrl = `${APP_URL}/profile/${followerId}`;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>新しいフォロワー</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">👤</div>
              <h1 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: bold;">新しいフォロワー</h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                こんにちは、${recipientName}さん
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                <strong>${followerName}</strong>さんがあなたをフォローしました。
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${profileUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  プロフィールを見る
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                このメールは Books Fan から送信されました
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
新しいフォロワー

こんにちは、${recipientName}さん

${followerName}さんがあなたをフォローしました。

プロフィールを見る: ${profileUrl}

Books Fan
${APP_URL}
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `【Books Fan】${followerName}さんがあなたをフォローしました`,
    html,
    text,
  });
}

/**
 * お問い合わせメールを送信
 */
export async function sendContactEmail(
  name: string,
  email: string,
  category: string,
  message: string
): Promise<boolean> {
  const categoryLabels: { [key: string]: string } = {
    general: "一般的な質問",
    technical: "技術的な問題",
    billing: "料金・請求について",
    feature: "機能の要望",
    other: "その他",
  };

  const categoryLabel = categoryLabels[category] || category;
  const adminEmail = "okapee.masapiro@gmail.com";

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせ - Books Fan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- ヘッダー -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📧 お問い合わせ</h1>
            </td>
          </tr>

          <!-- メインコンテンツ -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 20px; color: #333333;">新しいお問い合わせが届きました</h2>

              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #666666;">
                  <strong>お名前:</strong>
                </p>
                <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                  ${name}
                </p>

                <p style="margin: 0 0 12px; font-size: 14px; color: #666666;">
                  <strong>メールアドレス:</strong>
                </p>
                <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                  <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                </p>

                <p style="margin: 0 0 12px; font-size: 14px; color: #666666;">
                  <strong>お問い合わせ種別:</strong>
                </p>
                <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                  ${categoryLabel}
                </p>

                <p style="margin: 0 0 12px; font-size: 14px; color: #666666;">
                  <strong>お問い合わせ内容:</strong>
                </p>
                <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6; white-space: pre-line;">
                  ${message}
                </p>
              </div>

              <p style="margin: 20px 0 0; font-size: 14px; color: #999999;">
                このメールは Books Fan のお問い合わせフォームから送信されました。
              </p>
            </td>
          </tr>

          <!-- フッター -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Books Fan<br>
                <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">${APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
【Books Fan】お問い合わせ

新しいお問い合わせが届きました

お名前: ${name}
メールアドレス: ${email}
お問い合わせ種別: ${categoryLabel}

お問い合わせ内容:
${message}

---
このメールは Books Fan のお問い合わせフォームから送信されました。
${APP_URL}
  `;

  return sendEmail({
    to: adminEmail,
    subject: `【Books Fan】お問い合わせ - ${categoryLabel}`,
    html,
    text,
  });
}
