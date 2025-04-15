import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 特定の通知ルールを取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

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
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
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
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

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
