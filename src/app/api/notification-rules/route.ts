import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 通知ルール一覧取得
export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    const id = params.id;

    const rule = await prisma.notificationRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return NextResponse.json(
        { error: "Notification rule not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error fetching notification rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification rule" },
      { status: 500 },
    );
  }
}

// PUT: 通知ルールを更新
export async function PUT(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;

    const data = await request.json();

    const rule = await prisma.notificationRule.update({
      where: { id },
      data,
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error updating notification rule:", error);
    return NextResponse.json(
      { error: "Failed to update notification rule" },
      { status: 500 },
    );
  }
}

// DELETE: 通知ルールを削除
export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;

    await prisma.notificationRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification rule:", error);
    return NextResponse.json(
      { error: "Failed to delete notification rule" },
      { status: 500 },
    );
  }
}

// POST: 新規通知ルール作成
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Prismaを使って通知ルールを作成
    const rule = await prisma.notificationRule.create({
      data,
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error creating notification rule:", error);
    return NextResponse.json(
      { error: "Failed to create notification rule" },
      { status: 500 },
    );
  }
}
