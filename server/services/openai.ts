import OpenAI from "openai";

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * レビューのAI要約を生成（マインドマップ構造も含む）
 * @param reviewContent レビュー本文
 * @param bookTitle 本のタイトル
 * @param bookAuthor 本の著者
 * @returns 生成された要約とマインドマップ構造
 */
export async function generateReviewSummary(
  reviewContent: string,
  bookTitle: string,
  bookAuthor: string
): Promise<{
  summaryText: string;
  keyPoints: Array<{ point: string }>;
  mindmapStructure: string;
}> {
  const prompt = `以下は「${bookTitle}」（著者: ${bookAuthor}）についてのレビューです。

レビュー:
${reviewContent}

このレビューを分析して、以下のJSON形式で出力してください：

{
  "summary": "レビューの要約（2-3文で簡潔に）",
  "keyPoints": ["重要ポイント1", "重要ポイント2", "重要ポイント3"],
  "mindmap": "マインドマップ用のMarkdown形式の階層構造"
}

マインドマップは以下のような階層構造にしてください：
# ${bookTitle}
## 全体的な印象
### キーワード1
### キーワード2
## 良かった点
### 具体的な点1
### 具体的な点2
## 気になった点
### 具体的な点1

キーワードは簡潔に（10文字以内）、階層は最大3レベルまでにしてください。`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "あなたは本のレビューを分析して要点をまとめる専門家です。レビューの内容を正確に理解し、重要なポイントを簡潔にまとめ、視覚的に分かりやすいマインドマップ構造を作成します。必ず有効なJSON形式で出力してください。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 800,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("AI要約の生成に失敗しました");
  }

  try {
    const parsed = JSON.parse(content);
    return {
      summaryText: parsed.summary || "",
      keyPoints: (parsed.keyPoints || []).map((point: string) => ({ point })),
      mindmapStructure: parsed.mindmap || `# ${bookTitle}\n\n## レビュー要約\n\n${parsed.summary}`,
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    // フォールバック
    return {
      summaryText: content,
      keyPoints: [{ point: content }],
      mindmapStructure: `# ${bookTitle}\n\n## レビュー\n\n${content}`,
    };
  }
}

/**
 * 複数のレビューを統合してAI要約を生成
 * @param reviews レビュー配列
 * @param bookTitle 本のタイトル
 * @param bookAuthor 本の著者
 * @returns 生成された要約
 */
export async function generateMultipleReviewsSummary(
  reviews: Array<{ content: string; rating: number }>,
  bookTitle: string,
  bookAuthor: string
): Promise<string> {
  if (reviews.length === 0) {
    throw new Error("レビューが存在しません");
  }

  const reviewsText = reviews
    .map(
      (review, index) =>
        `レビュー${index + 1} (評価: ${review.rating}/5):\n${review.content}`
    )
    .join("\n\n");

  const prompt = `以下は「${bookTitle}」（著者: ${bookAuthor}）についての複数のレビューです。これらのレビュー全体から、この本の特徴や読者の評価を5つの箇条書きでまとめてください。

${reviewsText}

統合要約:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "あなたは本のレビューを分析して総合的な評価をまとめる専門家です。複数のレビューから共通点や重要なポイントを見つけ出し、本の特徴を客観的にまとめます。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  const summary = response.choices[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error("AI要約の生成に失敗しました");
  }

  return summary;
}

/**
 * 本の説明からAI要約を生成
 * @param bookTitle 本のタイトル
 * @param bookAuthor 本の著者
 * @param bookDescription 本の説明
 * @returns 生成された要約
 */
export async function generateBookSummary(
  bookTitle: string,
  bookAuthor: string,
  bookDescription: string | null
): Promise<{ summaryText: string; keyPoints: string[] }> {
  const description = bookDescription || "説明なし";

  const prompt = `以下の本について、読者に役立つAI要約を作成してください。

タイトル: ${bookTitle}
著者: ${bookAuthor}
説明: ${description}

以下の形式で要約を作成してください:

【概要】
本の内容を2-3文で簡潔に説明

【主要なポイント】
- ポイント1（60文字以内）
- ポイント2（60文字以内）
- ポイント3（60文字以内）
- ポイント4（60文字以内）
- ポイント5（60文字以内）

【こんな人におすすめ】
読者層や推奨する理由を1-2文で記述`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "あなたは本の内容を分析して、読者に役立つ要約を作成する専門家です。本の特徴や価値を正確に理解し、分かりやすく簡潔にまとめます。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });

  const fullSummary = response.choices[0]?.message?.content?.trim();

  if (!fullSummary) {
    throw new Error("AI要約の生成に失敗しました");
  }

  // キーポイントを抽出
  const keyPointsMatch = fullSummary.match(/【主要なポイント】([\s\S]*?)【/);
  const keyPointsSection = keyPointsMatch ? keyPointsMatch[1] : "";

  const keyPoints = keyPointsSection
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((point) => point.length > 0);

  return {
    summaryText: fullSummary,
    keyPoints,
  };
}
