import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { image } = data;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "画像データが不正です" },
        { status: 400 }
      );
    }

    // base64データをチェック
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "画像形式が不正です" },
        { status: 400 }
      );
    }

    const imageType = matches[1];
    const base64Data = matches[2];

    // サポートされている画像形式をチェック
    const allowedTypes = ["jpeg", "jpg", "png", "webp"];
    if (!allowedTypes.includes(imageType.toLowerCase())) {
      return NextResponse.json(
        { error: "サポートされていない画像形式です" },
        { status: 400 }
      );
    }

    // バッファに変換
    const buffer = Buffer.from(base64Data, "base64");

    // ファイルサイズチェック (5MB制限)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "画像サイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    // アップロードディレクトリの作成
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ファイル名を生成 (ユーザーIDとタイムスタンプ)
    const fileName = `${session.user.id}-${Date.now()}.${imageType}`;
    const filePath = path.join(uploadDir, fileName);

    // ファイルを保存
    await writeFile(filePath, buffer);

    // 画像のURL
    const imageUrl = `/uploads/profiles/${fileName}`;

    // データベースを更新
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
