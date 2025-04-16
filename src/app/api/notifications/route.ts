// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 通知一覧取得
export async function GET(request: Request) {
  try {
    // URLクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isRead = searchParams.get("isRead");

    // 検索条件を構築
    const whereConditions: Prisma.NotificationWhereInput = {};

    // ユーザーIDによるフィルタリング
    if (userId) {
      whereConditions.userId = userId;
    }

    // 既読/未読によるフィルタリング
    if (isRead !== null) {
      whereConditions.isRead = isRead === "true";
    }

    // 通知一覧を取得
    const notifications = await prisma.notification.findMany({
      where: whereConditions,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

// POST: 新規通知作成
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 通知作成
    const notification = await prisma.notification.create({
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
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}
