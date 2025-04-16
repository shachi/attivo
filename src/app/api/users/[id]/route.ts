// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 特定のユーザーを取得
export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT: ユーザーを更新
export async function PUT(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;
    const { name, email, role } = await request.json();

    // ユーザーの存在確認
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // メールアドレスの重複チェック（自分以外）
    if (email !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: "このメールアドレスは既に使用されています" },
          { status: 400 },
        );
      }
    }

    // ユーザー更新
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE: ユーザーを削除
export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;

    // 関連する資産の確認
    const relatedAssets = await prisma.asset.findMany({
      where: {
        OR: [{ purchasedById: id }, { currentUserId: id }],
      },
      select: { id: true },
    });

    if (relatedAssets.length > 0) {
      // 実際のアプリケーションでは、関連資産の処理方法を検討する必要があります
      // 例: デフォルトユーザーへの割り当て、または削除の禁止など

      // このサンプルでは、関連資産がある場合も削除を許可しますが、
      // 実運用では適切な対応が必要です
      console.warn(
        `Deleting user ${id} with ${relatedAssets.length} related assets`,
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
