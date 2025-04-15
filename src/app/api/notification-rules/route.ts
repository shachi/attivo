import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 通知ルール一覧取得
export async function GET() {
  try {
    const rules = await prisma.notificationRule.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching notification rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification rules" },
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
