// src/app/api/notifications/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 特定の通知を取得
export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification" },
      { status: 500 },
    );
  }
}

// PATCH: 通知の部分更新（既読/未読の設定など）
export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;
    const data = await request.json();

    // 通知の存在確認
    const existingNotification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    // 通知更新
    const notification = await prisma.notification.update({
      where: { id },
      data,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}

// DELETE: 通知を削除
export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    // paramsを先に await する
    const params = await context.params;
    const id = params.id;

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
